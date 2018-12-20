import cv2
import numpy as np

def eval_img(img):
    img_nparray = cv2.imdecode(np.asarray(bytearray(img.read()), dtype=np.uint8), cv2.IMREAD_UNCHANGED)
    # Do something
    print(img_nparray[100, 100])
    # Return some JSON data
    return {'filename':img.filename,'grade':100}
