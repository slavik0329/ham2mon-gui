import React from "react";
import {primary, primary2, primary4} from "./color";
import {DataItem} from "./DataItem";
import {FaTimes} from "react-icons/fa";
import {download, getLocalStorage, writeLocalStorage} from "./Utils";
import {useLocalStorage} from "./useLocalStorage";
import {Button} from "./Button";
import {Bar} from 'react-chartjs-2';
import Select from 'react-select'

/**
 * @return {null}
 */
export function Settings({visible, dirSize, freeSpace, handleClose, freqStats, showSince, setShowSince}) {
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
      backgroundColor: primary2,
      padding: 20,
      width: "100%",
      zIndex: 2000,
      boxSizing: "border-box",
      border: "1px solid #EEE",
      borderRadius: '0 0 6px 6px',
      color: primary4,
      boxShadow: '0px 3px 10px #585858'
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
      display: "flex",
      marginBottom: 20
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
    },
    serverIP: {
      marginTop: 10,
      color: primary
    },
    showCallsSince: {
      marginTop: 10,
      color: primary,
      display: "flex",
      alignItems: "baseline"
    },
    restoreText: {
      marginBottom: 10
    },
    timeSelectItem: {
      color: primary4
    }
  };

  const [serverIP, setServerIP] = useLocalStorage('setServerIP', '127.0.0.1');

  const customStyles = {
    control: (base, state) => ({
      ...base,
      boxShadow: "none",
      color: primary,
      border: `1px solid ${primary}`,
      width: 200,
      marginRight: 10
    })
  };

  const timeSelect = [
    {
      label: <div style={styles.timeSelectItem}>30 min</div>,
      value: 60 * 30
    },
    {
      label: <div style={styles.timeSelectItem}>1 hour</div>,
      value: 60 * 60
    },
    {
      label: <div style={styles.timeSelectItem}>2 hours</div>,
      value: 60 * 60 * 2
    },
    {
      label: <div style={styles.timeSelectItem}>1 day</div>,
      value: 60 * 60 * 24
    }
  ];

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
            type={"MB"}
            value={(dirSize / 1024 / 1024).toFixed(2)}
          />

          <DataItem
            title="Disk space available"
            type={"MB"}
            value={(freeSpace / 1024 / 1024).toFixed(2)}
          />
        </div>

        <div style={{width: 400, height: 200,}}>
          <Bar
            data={{
              labels: freqStats.map(stat => stat.freq),
              datasets: [
                {
                  label: 'Call count',
                  backgroundColor: primary,
                  data: freqStats.map(stat => stat.count)
                }
              ]

            }}
            width={200}
            height={200}
            options={{
              maintainAspectRatio: false,
              legend: {
                labels: {
                  fontColor: primary4,
                }
              },
              scales: {
                yAxes: [{
                  ticks: {
                    fontColor: primary4,
                    stepSize: 1,
                    min: 1
                  }
                }],
                xAxes: [{
                  ticks: {
                    fontColor: primary4,
                  }
                }]
              }
            }}
          />
        </div>

        <div style={styles.serverIP}>
          <span style={{color: primary4}}>Server IP</span>
          <input
            style={{
              padding: 8,
              fontSize: 14,
              marginLeft: 8,
              border: `1px solid ${primary}`,
              borderRadius: "4px 0 0 4px",
              color: primary4
            }}
            type={'text'}
            value={serverIP}
            onChange={(event) => {
              setServerIP(event.target.value)
            }}
          />
          <Button
            title={'Set'}
            type={"input"}
            onClick={() => window.location.reload()}
          />
        </div>

        <div style={styles.showCallsSince}>
          <span style={{color: primary4, marginRight: 8}}>Show calls since</span>

          <Select
            style={styles.select}
            value={timeSelect.find(time=>time.value===showSince)}
            options={timeSelect}
            styles={customStyles}
            theme={theme => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary25: primary2,
                primary: primary,
              },
            })}
            onChange={(res) => {
              setShowSince(res.value)
            }}
          />

          <Button
            title={'Set'}
            onClick={() => window.location.reload()}
          />
        </div>

        <div style={styles.controls}>
          <div>
            <Button
              title={'Backup Data'}
              secondary={true}
              onClick={() => {
                const storage = getLocalStorage();

                download('Ham2Mon-Gui-Backup-' + new Date().toDateString() + ".bak", storage);
              }}
            />
          </div>
          <div style={styles.restoreBlock}>
            <div style={styles.restoreText}>Restore backup by uploading it below</div>
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
