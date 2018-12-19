from flask import Flask, request, render_template

UPLOAD_DIR = './uploads/new/'

server = Flask(__name__)

@server.route('/upload', methods = ['GET', 'POST'])
def upload():
    if request.method == 'GET':
        return render_template('uploadpage.html')
    elif request.method == 'POST':
        for img in request.files.getlist('file'):
            # Do something?
            img.save(UPLOAD_DIR + img.filename)
        return 'file uploaded successfully'

server.run()