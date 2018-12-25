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

  onDrop = (acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach(img => {
      let formData = new FormData();
      this.setState((state, _) => ({
        ...state,
        waitingForFiles: state.waitingForFiles + 1,
      }));
      formData.append('file', img);
      fetch('http://103.216.223.11:18501/result', { method: 'POST', body: formData })
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
        <div className='flex-0 header'>
          <div className='title'><strong>Korektor LJK TONAMPTN</strong> by Karang Praga </div>
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
            <div className='filebars-title'> Files </div>
            <div className='filebars-action'>
              <div> Save </div>
              <div className='danger' onClick={this.onDeleteButtonClick}> Delete Selected </div>
            </div>
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
