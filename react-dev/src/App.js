import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import config from './config';
import './App.css';

class FileBar extends Component {
  render() {
    return (
        <div
            className={classNames('filebar', {'active': this.props.active})}
            onClick={this.props.onClick}
            idx={this.props.idx}
        >
          {this.props.children}
        </div>
    );
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      waitingForFiles: 0,
      activeIdx: -1,
      workingFiles: [],
    };
  }

  convertAnswer = (answer) => {
    console.log(answer);
    let answerShown = '';
    while (answer.length > 0) {
      answerShown += answer.substring(0, 10) + '\n';
      answer = answer.substring(10);
    }
    return answerShown;
  };

  getCsvFromFiles = (files) => {
    let result = "";
    console.log(files);
    files.forEach((file) => {
      let arrAnswer = file.result.answer.split("");
      let counter = 0;
      arrAnswer.forEach((answer) => {
        if (counter > 0) result += ",";
        result += answer;
        counter++;
      });
      result += "\n";
    });
    return result;
  };

  downloadCsv = (csv, filename) => {
    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    let data = encodeURI(csv);

    let link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach(img => {
      let formData = new FormData();
      this.setState((state, _) => ({
        ...state,
        waitingForFiles: state.waitingForFiles + 1,
      }));
      formData.append('file', img);
      fetch(config.serverUrl + '/result', {method: 'POST', body: formData})
          .then(res => res.json())
          .then(data => {
            this.setState((state, _) => ({
              ...state,
              waitingForFiles: state.waitingForFiles - 1,
              workingFiles: [
                ...state.workingFiles,
                {
                  filename: img.name,
                  result: {
                    ...data,
                    answerShown: this.convertAnswer(data.answer),
                  },
                }
              ]
            }))
          });
    });
  };

  onFileBarClick = (e) => {
    let idx = parseInt(e.currentTarget.getAttribute('idx'));
    this.setState((state, _) => ({
      ...state,
      activeIdx: idx,
      previewImageEncoded: this.state.workingFiles[idx].result.encoded,
    }));
  };

  onDeleteButtonClick = (e) => {
    this.setState((state, _) => {
      let newWorkingFiles = state.workingFiles.slice();
      newWorkingFiles.splice(state.activeIdx, 1);
      return {
        ...state,
        activeIdx: -1,
        workingFiles: newWorkingFiles,
      };
    });
  };

  onSaveAsCsvButtonClick = (e) => {
    let csv = this.getCsvFromFiles(this.state.workingFiles);
    this.downloadCsv(csv, "jawaban.csv");
  };

  render() {
    let workingFiles = [];
    this.state.workingFiles.forEach((workingFile, idx) => {
      workingFiles.push(
          <FileBar
              key={idx}
              idx={idx}
              onClick={this.onFileBarClick}
              active={this.state.activeIdx === idx}
          >
            {workingFile.result.number}
          </FileBar>
      );
    });
    return (
        <div className='d-flex flex-col h-100'>
          <div className='flex-0 header'>
            <div className='title'><strong>Korektor LJK TONAMPTN</strong> by Karang Praga</div>
            {this.state.waitingForFiles === 0 && (
                <Dropzone onDrop={this.onDrop} multiple>
                  {({getRootProps, getInputProps, isDragActive}) => {
                    return (
                        <div
                            {...getRootProps()}
                            className={classNames('dropzone', {'dropzone--isActive': isDragActive})}
                        >
                          <input {...getInputProps()} />
                          {
                            isDragActive ?
                                <p>Drop!</p> :
                                <p>Drag file-file gambar ke sini atau klik kotak ini untuk mengupload gambar LJK...</p>
                          }
                        </div>
                    )
                  }}
                </Dropzone>
            )}
            {this.state.waitingForFiles > 0 && (
                <div className='waiting'>
                  <p> Masih memroses {this.state.waitingForFiles} gambar ... </p>
                </div>
            )}
          </div>

          <div className='d-flex flex-row flex-1 main'>
            <div className='filebars'>
              <div className='filebars-title'> Files</div>
              <div className='filebars-action'>
                <div onClick={this.onSaveAsCsvButtonClick}> Save as CSV</div>
                <div className='danger' onClick={this.onDeleteButtonClick}> Delete Selected</div>
              </div>
              {workingFiles}
            </div>
            {this.state.activeIdx > -1 && (
                <div className='fileinfo'>
                  <div className='fileinfo-title'> Nama</div>
                  <div className='fileinfo-content'> {this.state.workingFiles[this.state.activeIdx].result.name} </div>
                  <div className='fileinfo-title'> Nomor Peserta</div>
                  <div
                      className='fileinfo-content'> {this.state.workingFiles[this.state.activeIdx].result.number} </div>
                  <div className='fileinfo-title'> Jawaban</div>
                  <div className='fileinfo-content'>
                <pre>
                  {this.state.workingFiles[this.state.activeIdx].result.answerShown}
                </pre>
                  </div>
                </div>
            )}
            <div className='preview'>
              {this.state.activeIdx >= 0 && (
                  <img alt='result' src={'data:image/png;base64,' + this.state.previewImageEncoded}/>
              )}
              {this.state.activeIdx === -1 && (
                  <div className='middle'>
                    Upload file dan pilih file di kiri untuk melihat preview
                  </div>
              )}
            </div>
          </div>

        </div>
    );
  }
}
