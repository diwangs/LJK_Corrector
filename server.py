from flask import Flask, request, render_template, jsonify
from flask_cors import CORS, cross_origin
import corrector

server = Flask(__name__)
cors = CORS(server)
server.config['CORS_HEADERS'] = 'Content-Type'


@server.route('/', methods=['GET'])
def upload():
    return render_template('index.html')


@server.route('/result', methods=['POST'])
@cross_origin()
def process():
    result = corrector.eval_img(request.files['file'].read())
    return jsonify(result)


server.run(debug=True)
