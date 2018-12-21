import cv2
import numpy as np
import base64


class Image:
    CELL_MARGIN = 0.2
    FILLED_PERCENTAGE = 50
    IMG_WIDTH = 1000
    LJK_RATIO = 19.2 / 26
    MIN_CIRCULARITY = 0.50
    ROW, COL = 60, 43

    def __init__(self, img):
        self.original_image = img
        self.original_height = img.shape[0]
        self.original_width = img.shape[1]
        self.original_ratio = self.original_width * 1.0 / self.original_height
        self.result_image = self.original_image.copy()
        self.working_image = self.original_image.copy()

    def get_base64_result_image(self):
        encoded = cv2.imencode('.png', self.result_image)[1].tostring()
        result = base64.b64encode(encoded).decode('utf-8')
        return str(result)

    def process(self):
        self.__resize()
        self.__threshold()
        self.__detect_and_wrap_corner()
        self.__create_answer_matrix()

    def __create_answer_matrix(self):
        offset = int(self.IMG_WIDTH / (self.COL) / 2)
        ljk_mat = [[0 for i in range(self.COL)] for j in range(self.ROW)]
        for i in range(0, self.ROW):
            for j in range(0, self.COL):
                r, c = self.__get_coordinate_from_indices(i, j)
                if (self.__is_filled(i, j)):
                    cv2.rectangle(self.result_image, (c, r), (c + offset * 2, r + offset * 2), 128, 5)
                    ljk_mat[i][j] = 1
        return ljk_mat

    def __detect_and_wrap_corner(self):
        img = self.working_image.copy()
        blur_radius = self.IMG_WIDTH // 100 * 2 + 1
        img = cv2.GaussianBlur(img, (blur_radius, blur_radius), 0)
        r, img = cv2.threshold(img, 180, 255, cv2.THRESH_BINARY)

        kp, points = self.__find_four_key_point(img, self.MIN_CIRCULARITY)

        # self.working_image = cv2.drawKeypoints(
        #     img, kp, np.array([]), (0, 0, 255),
        #     cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
        # cv2.imshow('image', img_with_keypoints)
        # cv2.waitKey(0)

        # sort clockwise from top-left
        def cmp(point):
            center = img.shape[1] / 2, img.shape[0] / 2
            if point[0] < center[0]:
                if (point[1] < center[1]):
                    return 0
                else:
                    return 3
            else:
                if (point[1] < center[1]):
                    return 1
                else:
                    return 2

        points = np.array(sorted(points, key=cmp), dtype=np.float32)
        out_size = (self.IMG_WIDTH, int(self.IMG_WIDTH / self.LJK_RATIO))
        offset = (out_size[0] / self.COL / 2, out_size[1] / self.ROW / 2)
        dst = np.array([
            [offset[0], offset[1]],
            [out_size[0] - offset[0], offset[1]],
            [out_size[0] - offset[0], out_size[1] - offset[1]],
            [offset[0], out_size[1] - offset[1]]],
            dtype=np.float32)

        matrix = cv2.getPerspectiveTransform(points, dst)

        self.working_image = cv2.warpPerspective(self.working_image, matrix, out_size)
        self.result_image = cv2.warpPerspective(self.result_image, matrix, out_size)

    def __find_four_key_point(self, img, circularity):
        # find 4 keypoint from image with known minimum circularity
        # on the blob detector
        params = cv2.SimpleBlobDetector_Params()

        params.filterByCircularity = True
        params.minCircularity = circularity
        params.maxCircularity = 1

        params.filterByConvexity = True
        params.minConvexity = 0.85

        params.filterByArea = True
        params.minArea = self.working_image.shape[0] * img.shape[1] // 10000

        det = cv2.SimpleBlobDetector_create(params)
        kp = det.detect(img)

        if (len(kp) == 0):
            return [], []

        hulls = cv2.convexHull(cv2.KeyPoint_convert(kp))
        points = [[img.shape[0], img.shape[1]], [0, img.shape[1]], [img.shape[0], 0], [0, 0]]
        for hull in hulls:
            if (hull[0][0] + hull[0][1] < points[0][0] + points[0][1]):
                points[0] = hull[0]
            if (hull[0][0] - hull[0][1] > points[1][0] - points[1][1]):
                points[1] = hull[0]
            if (hull[0][0] - hull[0][1] < points[2][0] - points[2][1]):
                points[2] = hull[0]
            if (hull[0][0] + hull[0][1] > points[3][0] + points[3][1]):
                points[3] = hull[0]

        points[3] = [points[1][0], points[2][1]]
        return kp, points

    def __get_coordinate_from_indices(self, row, col):
        t_row = self.working_image.shape[0]
        t_col = self.working_image.shape[1]

        r = int(row * t_row / self.ROW)
        c = int(col * t_col / self.COL)

        return r, c

    def __is_filled(self, row, col):
        width = int(self.IMG_WIDTH / (self.COL))

        r_top, c_lft = self.__get_coordinate_from_indices(row, col)
        r_btm = r_top + width
        c_rgt = c_lft + width

        r_top += int(self.CELL_MARGIN * width)
        c_lft += int(self.CELL_MARGIN * width)
        r_btm -= int(self.CELL_MARGIN * width)
        c_rgt -= int(self.CELL_MARGIN * width)

        cnt_black = 0
        for r_i in range(r_top, r_btm + 1):
            for c_i in range(c_lft, c_rgt + 1):
                if (self.working_image[r_i][c_i] < 120):
                    cnt_black += 1

        filled_percentage = cnt_black * 100 / ((r_btm - r_top + 1) * (c_rgt - c_lft + 1))
        return (filled_percentage >= self.FILLED_PERCENTAGE)

    def __threshold(self):
        self.working_image = cv2.cvtColor(self.working_image, cv2.COLOR_BGR2GRAY)
        self.working_image = cv2.GaussianBlur(self.working_image, (11, 11), 0)
        self.working_image = cv2.adaptiveThreshold(
            src=self.working_image,
            maxValue=255,
            adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            thresholdType=cv2.THRESH_BINARY,
            blockSize=25,
            C=12)

    def __resize(self):
        self.working_image = cv2.resize(
            self.working_image,
            (self.IMG_WIDTH, int(self.IMG_WIDTH / self.original_ratio)))
        self.result_image = self.working_image.copy()


def eval_img(raw_img):
    img = cv2.imdecode(np.fromstring(raw_img, np.uint8), cv2.IMREAD_UNCHANGED)
    image = Image(img)
    image.process()
    return {
        'filename': 'mock',
        'grade': 100,
        'encoded': image.get_base64_result_image()
    }
