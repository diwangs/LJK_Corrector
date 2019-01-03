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
      modal: {
        shown: false,
        title: '',
        content: '',
      }
    };
  }

  getCsvFromFiles = (files) => {
    let result = '';
    result += 'no peserta,nama';
    for (let i = 1; i <= 120; i++) {
      result += ',' + i;
    }
    result += '\n';
    files.forEach((file) => {
      let arrAnswer = file.result.answer.split('');
      result += file.result.number + ',' + file.result.name;
      arrAnswer.forEach((answer) => {
        result += ',' + answer;
      });
      result += '\n';
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

  onSaveAsCsvButtonClick = (e) => {
    let csv = this.getCsvFromFiles(this.state.workingFiles);
    this.downloadCsv(csv, 'jawaban.csv');
  };

  handleChange = (e) => {
    let newValue = e.currentTarget.value;
    let key = e.currentTarget.getAttribute('name');
    this.setState((state, _) => {
      let newWorkingFiles = state.workingFiles.slice();
      newWorkingFiles[state.activeIdx].result[key] = newValue;
      return {
        ...state,
        workingFiles: newWorkingFiles,
      };
    });
  };

  summonModal = (title, content) => {
    this.setState((state, _) => ({
      ...state,
      modal: {
        shown: true,
        title: title,
        content: content,
      }
    }));
  };

  summonHelpModal = () => {
    let title = 'Cara Pakai';
    let content = (
      <div>
        <ol>
          <li> Download aplikasi CamScanner dari Play Store / App Store </li>
          <li> Buka aplikasi CamScanner (ga harus bikin akun) </li>
          <li> Klik kamera di kanan bawah </li>
          <li> Ambil foto LJK. Pastikan: </li>
          <ul>
            <li> LJK tidak tertekuk / lingsut. </li>
            <li> LJK difoto tegak (tidak terputar 90 / 180 derajat) </li>
            <li> Semua sudut kertas terlihat </li>
            <li> Jawaban peserta tidak memantulkan sinar (semuanya hitam) </li>
          </ul>
          <li> Atur supaya CamScanner bisa mendeteksi seluruh ujung kertas, lalu tekan check di kanan bawah </li>
          <li> Pilih salah satu filter warna (bisa dicoba2 mana yang paling sesuai) </li>
          <li> Save foto sebagai jpg, lalu upload di sini. </li>
          <li> Tiap foto yang diupload akan diproses (biasanya 1 - 10 detik). Jika tidak ada progres, bisa lapor </li>
          <li> Tiap hasil bisa diedit manual: </li>
          <ul>
            <li> Setiap lingkaran yang terdeteksi akan digambari kotak </li>
            <li> Jika ada kesalahan, Anda dapat merubah manual </li>
            <li> Jika gambar tidak ter-align dengan baik, Anda bisa menghapus dan mengupload ulang </li>
          </ul>
          <li> Terakhir, save sebagai CSV untuk diproses lebih lanjut (CSV bisa dibuka di Google Sheet, MS Excel, atau sejenisnya) </li>
        </ol>
        <p> Disclaimer: kami tidak bertanggung jawab jika ada kesalahan pengoreksian. Silakan dicoba-coba sebelum hari H, jadi hari H tidak terlalu bermasalah. </p>
        <p>
          Aplikasi ini dibangun menggunakan flask dan reactjs.
          Jika di paguyuban Anda ada yang mampu, sangat disarankan untuk menjalankan aplikasi ini manual (karena di internet cukup lambat).
          Download aplikasinya di <a href='https://github.com/diwangs/LJK_Corrector'>https://github.com/diwangs/LJK_Corrector</a>
        </p>
      </div>
    );
    this.summonModal(title, content);
  };

  summonCreditModal = () => {
    let title = 'Credit';
    let content = (
      <div>
        <p> Yonas Adiel (Karang Praga) </p>
        <p> Senapati S. Diwangkara (Karang Praga) </p>
        <p> Gery Wahyu (PKB Bali Dwipa) </p>
      </div>
    );
    this.summonModal(title, content);
  };

  closeModal = () => {
    this.setState((state, _) => ({
      ...state,
      modal: {
        shown: false,
        title: '',
        content: '',
      }
    }))
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
            {workingFile.result.number}
          </FileBar>
      );
    });
    return (
        <div className='d-flex flex-col h-100'>
          <div className='flex-0 header'>
            <div className='title'>
              <strong> Korektor LJK TONAMPTN </strong>
              by
              <span className='cursor-pointer' onClick={this.summonCreditModal}> Karang Praga ft. PKB Bali Dwipa </span>
            </div>
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
              <div className='filebars-title'>
                <strong> Files </strong>
                <span className='cursor-pointer' onClick={this.summonHelpModal}> (butuh bantuan?) </span>
              </div>
              <div className='filebars-action'>
                <div onClick={this.onSaveAsCsvButtonClick}> Save as CSV</div>
                <div className='danger' onClick={this.onDeleteButtonClick}> Delete Selected</div>
              </div>
              <div className='filebars-files'>
                {workingFiles}
              </div>
            </div>
            {this.state.activeIdx > -1 && (
                <div className='fileinfo'>
                  <div className='fileinfo-title'> Nama </div>
                  <input
                    className='fileinfo-content'
                    value={this.state.workingFiles[this.state.activeIdx].result.name}
                    name='name'
                    onChange={this.handleChange}
                  />
                  <div className='fileinfo-title'> Nomor Peserta </div>
                  <input
                    className='fileinfo-content'
                    value={this.state.workingFiles[this.state.activeIdx].result.number}
                    name='number'
                    onChange={this.handleChange}
                  />
                  <div className='fileinfo-title'> Jawaban </div>
                  <textarea
                    className='fileinfo-content'
                    value={this.state.workingFiles[this.state.activeIdx].result.answer}
                    name='answer'
                    onChange={this.handleChange}
                    cols={9}
                    rows={12}
                  />
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
          {this.state.modal.shown && (<div className='modal-container' onClick={this.closeModal}>
            <div className='modal-content'>
              <div className='modal-header'>
                {this.state.modal.title}
                <div className='modal-close'></div>
              </div>
              <div className='modal-body'>
                {this.state.modal.content}
              </div>
            </div>
          </div>)}

        </div>
    );
  }
}
