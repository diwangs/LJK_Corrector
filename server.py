from flask import Flask, request, Response, render_template, jsonify
import corrector

server = Flask(__name__)

@server.route('/', methods = ['GET'])
def upload():
    return render_template('index.html')    

@server.route('/result', methods = ['POST'])
def process():
    result = []
    for img in request.files.getlist('file'):
        result.append(corrector.eval_img(img))
    return jsonify(result)

server.run()