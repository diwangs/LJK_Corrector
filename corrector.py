# We could use this: https://docs.python.org/3/library/asyncio.html
# Python 3.7 only tho, what do you think?

import cv2
import numpy as np
import os  

while True:
    for fn in os.listdir('./uploads/new/'):
        img = cv2.imread('./uploads/new/' + fn)    
        # Do something
        print(img[100, 100])
        # Move it to 'processed'
        os.rename('./uploads/new/' + fn, './uploads/processed/' + fn)
        print('Processed: ' + fn)
