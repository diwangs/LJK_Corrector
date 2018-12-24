import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import './App.css';

class FileBar extends Component {
  render() {
    return (
      <div
        className={classNames('filebar', { 'active': this.props.active })}
        onClick={this.props.onClick}
        idx={this.props.idx}
      >
        - {this.props.children}
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

  onDrop = (acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach(img => {
      let formdata = new FormData();
      this.setState((state, _) => ({
        ...state,
        waitingForFiles: state.waitingForFiles + 1,
      }));
      formdata.append('file', img);
      fetch('http://103.216.223.11:18501/result', { method: 'POST', body: formdata })
        .then(res => res.json())
        .then(data => {
          this.setState((state, _) => ({
            ...state,
            waitingForFiles: state.waitingForFiles - 1,
            workingFiles: [
              ...state.workingFiles,
              {
                filename: img.name,
                result: data,
              }
            ]
          }))
        });
    });
  }

  onFileBarClick = (e) => {
    let idx = e.currentTarget.getAttribute('idx');
    this.setState((state, _) => ({
      ...state,
      activeIdx: parseInt(idx),
      previewImageEncoded: this.state.workingFiles[idx].result.encoded,
    }));
  }

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
          {workingFile.filename}
        </FileBar>
      );
    });
    return (
      <div className='d-flex flex-col h-100'>
        <div className='flex-0'>
          <h1 className='title'>Korektor LJK TONAMPTN</h1>
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
              Sedang memroses...
            </div>
          )}
        </div>

        <div className='d-flex flex-row flex-1 main'>
          <div className='filebars d-flex flex-col'>
            {workingFiles}
          </div>
          <div className='preview'>
            {this.state.activeIdx >= 0 && (
              <img alt='result' src={'data:image/png;base64,' + this.state.previewImageEncoded} />
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
