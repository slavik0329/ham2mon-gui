import React from "react";
import {primary} from "./color";
import {DataItem} from "./DataItem";
import {FaTimes} from "react-icons/fa";
import {BooleanOption} from "./BooleanOption";
import {getLocalStorage, writeLocalStorage} from "./Utils";

/**
 * @return {null}
 */
export function Settings({visible, dirSize, freeSpace, handleClose}) {
  const styles = {
    outerContainer: {
      position: "fixed",
      padding: 20,
      width: "100%",
      zIndex: 2000,
      boxSizing: "border-box",
      backgroundColor: "#00000055",
      height: '100%',
    },
    container: {
      backgroundColor: "#FFF",
      padding: 20,
      width: "100%",
      zIndex: 2000,
      boxSizing: "border-box",
      border: "1px solid #EEE",
      borderRadius: '0 0 6px 6px'
    },
    titleBar: {
      position: "relative",
      backgroundColor: primary,
      color: "#FFF",
      fontSize: 24,
      padding: 8,
      borderRadius: '6px 6px 0 0'
    },
    dataItems: {
      display: "flex"
    },
    closeButton: {
      position: "absolute",
      right: 8,
      top: 12,
      cursor: "pointer"
    },
    controls: {
      marginTop: 14
    },
   restoreBlock: {
      marginTop: 10
   }
  };

  const download = (filename, text) => {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  };



  return visible ? (
    <div
      style={styles.outerContainer}
    >
      <div style={styles.titleBar}>
        <FaTimes
          style={styles.closeButton}
          onClick={handleClose}
        />
        Settings
      </div>
      <div
        style={styles.container}
      >
        <div style={styles.dataItems}>
          <DataItem
            title="WAV directory size"
            value={`${(dirSize / 1024 / 1024).toFixed(2)}MB`}
          />

          <DataItem
            title="Disk space available"
            value={`${(freeSpace / 1024 / 1024).toFixed(2)}MB`}
          />
        </div>

        <div style={styles.controls}>
          <BooleanOption
            title={'Backup Data'}
            type={'settings'}
            onClick={() => {
              const storage = getLocalStorage();

              download('Ham2Mon-Gui-Backup-' + new Date().toDateString() + ".bak", storage);
            }}
          />
          <div style={styles.restoreBlock}>
            <div>Restore backup by uploading it below</div>
            <input
              type={'file'}
              onChange={(event) => {
                const fileReader = new FileReader();

                fileReader.onloadend = () => {
                  if (window.confirm('Are you sure you want to restore this data?')) {
                    const data = fileReader.result;
                    writeLocalStorage(data);

                    window.location.reload();
                  }
                };

                fileReader.readAsText(event.target.files[0]);

                console.log(event.target.files[0])
              }}
            />
          </div>
        </div>

        {/*{backupData ? <div style={styles.backupBlock}>*/}
        {/*  <div>Copy data b</div>*/}
        {/*  <textarea*/}
        {/*    ref={backupTextRef}*/}
        {/*    style={styles.textArea}*/}
        {/*    onClick={()=>backupTextRef.current.select()}*/}
        {/*  >*/}
        {/*    {backupData}*/}
        {/*  </textarea>*/}
        {/*</div> : null}*/}
      </div>
    </div>
  ) : null;
}
