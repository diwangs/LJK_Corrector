import React, { Component } from 'react';
import Titlebar from './components/Titlebar';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import './App.css';

class App extends Component {
  onDrop = (acceptedFiles, rejectedFiles) => {
    // Each file calls the endpoint asynchronously?
    acceptedFiles.forEach(img => {
      let formdata = new FormData()
      formdata.append("file", img)
      fetch('http://localhost:5000/result', {method: 'POST', body:formdata})
        .then(res => res.json())
        .then(data => console.log(data))
        // data is the result 
    });
  }
  
  render() {
    return (
      <div className="App">
        <Titlebar/>
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
      </div>
    );
  }
}

export default App;
