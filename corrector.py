import cv2
import numpy as np
import base64


class Image:
    def __init__(self, img):
        self.original_image = img
        self.original_height = img.shape[0]
        self.original_width = img.shape[1]
        self.original_ratio = self.original_width * 1.0 / self.original_height

        self.working_image = cv2.cvtColor(self.original_image, cv2.COLOR_BGR2GRAY)
        self.working_image = cv2.adaptiveThreshold(
            src=self.working_image,
            maxValue=255,
            adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            thresholdType=cv2.THRESH_BINARY,
            blockSize=25,
            C=12)

    def get_base64_working_image(self):
        encoded = cv2.imencode('.png', self.working_image)[1].tostring()
        result = base64.b64encode(encoded).decode('utf-8')
        return str(result)


def eval_img(raw_img):
    img = cv2.imdecode(np.fromstring(raw_img, np.uint8), cv2.IMREAD_UNCHANGED)
    image = Image(img)
    return {
        'filename': 'mock',
        'grade': 100,
        'encoded': image.get_base64_working_image()
    }
