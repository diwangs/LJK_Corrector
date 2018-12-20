from flask import Flask, request, render_template, jsonify
import corrector

UPLOAD_DIR = './uploads/new/'

server = Flask(__name__)

@server.route('/upload', methods = ['GET', 'POST'])
def upload():
    if request.method == 'GET':
        return render_template('uploadpage.html')
    elif request.method == 'POST':
        result = []
        for img in request.files.getlist('file'):
            result.append(corrector.eval_img(img))
        return jsonify(result)

server.run()