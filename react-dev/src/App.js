import React, { Component } from 'react';
import Titlebar from './components/Titlebar';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
    };
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    // Each file calls the endpoint asynchronously?
    acceptedFiles.forEach(img => {
      let formdata = new FormData()
      formdata.append("file", img)
      fetch('http://localhost:5000/result', {method: 'POST', body:formdata})
        .then(res => res.json())
        .then(data => {
          this.setState((state, _) => ({
            ...state,
            result: data,
          }))
        })
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

        {this.state.result && (
          <img alt='result' src={'data:image/png;base64,' + this.state.result.encoded} />
        )}
      </div>
    );
  }
}

export default App;
