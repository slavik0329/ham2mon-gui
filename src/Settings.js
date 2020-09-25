import React, {useCallback, useMemo, useState} from 'react';
import {primary, primary2, primary4} from './color';
import {DataItem} from './DataItem';
import {FaTimes} from 'react-icons/fa';
import {download, getLocalStorage, sec2time, writeLocalStorage} from './Utils';
import {useLocalStorage} from './hooks/useLocalStorage';
import {Button} from './Button';
import {Bar} from 'react-chartjs-2';
import Select from 'react-select';

/**
 * @return {null}
 */
export const Settings = ({
  visible,
  dirSize,
  freeSpace,
  handleClose,
  freqStats,
  showSince,
  setShowSince,
  setShowOnlyFreq,
  handleDeleteBefore,
  freqData,
  autoloadDelay,
  setAutoloadDelay,
}) => {
  const styles = {
    outerContainer: {
      position: 'fixed',
      padding: 20,
      width: '100%',
      zIndex: 2000,
      boxSizing: 'border-box',
      backgroundColor: '#00000055',
      height: '100%',
      overflowY: 'scroll',
    },
    container: {
      backgroundColor: primary2,
      padding: 20,
      width: '100%',
      zIndex: 2000,
      boxSizing: 'border-box',
      border: '1px solid #EEE',
      borderRadius: '0 0 6px 6px',
      color: primary4,
      boxShadow: '0px 3px 10px #585858',
    },
    titleBar: {
      position: 'relative',
      backgroundColor: primary,
      color: '#FFF',
      fontSize: 24,
      padding: 8,
      borderRadius: '6px 6px 0 0',
    },
    dataItems: {
      display: 'flex',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    closeButton: {
      position: 'absolute',
      right: 8,
      top: 12,
      cursor: 'pointer',
    },
    controls: {
      marginTop: 14,
    },
    restoreBlock: {
      backgroundColor: '#FFF',
      marginTop: 10,
      padding: 10,
      borderRadius: 4,
      maxWidth: 600,
    },
    selectBlock: {
      marginTop: 10,
      color: primary,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
    },
    restoreText: {
      marginBottom: 10,
      fontSize: 18,
    },
    timeSelectItem: {
      color: primary4,
    },
    selectBlockText: {
      color: primary4,
      marginRight: 8,
      marginBottom: 4,
    },
    chart: {
      maxWidth: 600,
      backgroundColor: '#FFF',
      padding: 8,
      borderRadius: 4,
    },
    chartTitle: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 6,
    },
  };

  const namedFreqStats = freqStats.map((freqStat) => {
    const name = freqData.find((item) => item.freq === freqStat.freq);

    return {
      ...freqStat,
      name: name ? name.name : '',
    };
  });

  const [serverIP, setServerIP] = useLocalStorage('setServerIP', '127.0.0.1');

  const customStyles = {
    control: (base, state) => ({
      ...base,
      boxShadow: 'none',
      color: primary,
      border: `1px solid ${primary}`,
      width: 200,
      marginRight: 10,
    }),
  };

  const timeSelect = useMemo(
    () => [
      {
        label: <div style={styles.timeSelectItem}>10 min</div>,
        value: 60 * 10,
      },
      {
        label: <div style={styles.timeSelectItem}>30 min</div>,
        value: 60 * 30,
      },
      {
        label: <div style={styles.timeSelectItem}>1 hour</div>,
        value: 60 * 60,
      },
      {
        label: <div style={styles.timeSelectItem}>2 hours</div>,
        value: 60 * 60 * 2,
      },
      {
        label: <div style={styles.timeSelectItem}>1 day</div>,
        value: 60 * 60 * 24,
      },
      {
        label: <div style={styles.timeSelectItem}>2 days</div>,
        value: 60 * 60 * 24 * 2,
      },
      {
        label: <div style={styles.timeSelectItem}>3 days</div>,
        value: 60 * 60 * 24 * 3,
      },
      {
        label: <div style={styles.timeSelectItem}>1 week</div>,
        value: 60 * 60 * 24 * 7,
      },
      {
        label: <div style={styles.timeSelectItem}>Forever</div>,
        value: 60 * 60 * 24 * 10000,
      },
    ],
    [styles.timeSelectItem],
  );

  const delaySelect = useMemo(
    () => [
      {
        label: <div style={styles.timeSelectItem}>Never</div>,
        value: 0,
      },
      {
        label: <div style={styles.timeSelectItem}>5 seconds</div>,
        value: 5,
      },
      {
        label: <div style={styles.timeSelectItem}>30 seconds</div>,
        value: 30,
      },
      {
        label: <div style={styles.timeSelectItem}>1 minute</div>,
        value: 60,
      },
      {
        label: <div style={styles.timeSelectItem}>2 minutes</div>,
        value: 60 * 2,
      },
      {
        label: <div style={styles.timeSelectItem}>5 minutes</div>,
        value: 60 * 5,
      },
      {
        label: <div style={styles.timeSelectItem}>10 minutes</div>,
        value: 60 * 10,
      },
      {
        label: <div style={styles.timeSelectItem}>30 minutes</div>,
        value: 60 * 30,
      },
      {
        label: <div style={styles.timeSelectItem}>1 hour</div>,
        value: 60 * 60,
      },
    ],
    [styles.timeSelectItem],
  );

  const [removeBefore, setRemoveBefore] = useState(60 * 60 * 24);

  const callsSinceSelectValue = timeSelect.find(
    (time) => time.value === showSince,
  );
  const autoloadDelaySelectValue = delaySelect.find(
    (time) => time.value === autoloadDelay,
  );
  const removeBeforeSelectValue = timeSelect.find(
    (time) => time.value === removeBefore,
  );

  const getBarChart = useCallback(() => {
    return (
      <Bar
        getElementAtEvent={(el) => {
          setShowOnlyFreq(el[0]._view.label.split(' ')[0]);
          handleClose();
        }}
        data={{
          labels: namedFreqStats.map(
            (stat) => stat.freq + ' ' + stat.name.substr(0, 8),
          ),
          datasets: [
            {
              label: 'Call count',
              backgroundColor: primary,
              data: freqStats.map((stat) => stat.count),
            },
          ],
        }}
        height={200}
        options={{
          maintainAspectRatio: false,
          legend: {
            labels: {
              fontColor: primary4,
            },
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  fontColor: primary4,
                  stepSize: 1,
                  min: 1,
                },
              },
            ],
            xAxes: [
              {
                ticks: {
                  fontColor: primary4,
                },
              },
            ],
          },
        }}
      />
    );
  }, [freqStats, handleClose, namedFreqStats, setShowOnlyFreq]);

  return visible ? (
    <div style={styles.outerContainer}>
      <div style={styles.titleBar}>
        <FaTimes style={styles.closeButton} onClick={handleClose} />
        Settings
      </div>
      <div style={styles.container}>
        <div style={styles.dataItems}>
          <DataItem
            title="WAV directory size"
            type={'MB'}
            value={(dirSize / 1024 / 1024).toFixed(2)}
          />

          <DataItem
            title="Disk space available"
            type={'MB'}
            value={(freeSpace / 1024 / 1024).toFixed(2)}
          />

          <DataItem
            title="Total audio duration"
            type={''}
            value={sec2time(dirSize / 16000, true)}
          />
        </div>

        <div style={styles.chart}>
          <div style={styles.chartTitle}>
            Activity for last {callsSinceSelectValue.label.props.children}
          </div>
          {getBarChart()}
        </div>

        <div style={styles.selectBlock}>
          <span style={{color: primary4}}>Server IP</span>
          <input
            style={{
              padding: 8,
              fontSize: 14,
              marginLeft: 8,
              border: `1px solid ${primary}`,
              borderRadius: '4px 0 0 4px',
              color: primary4,
            }}
            type={'text'}
            value={serverIP}
            onChange={(event) => {
              setServerIP(event.target.value);
            }}
          />
          <Button
            title={'Set'}
            type={'input'}
            onClick={() => window.location.reload()}
          />
        </div>

        <div style={styles.selectBlock}>
          <span style={styles.selectBlockText}>Show calls since</span>

          <Select
            style={styles.select}
            value={callsSinceSelectValue}
            options={timeSelect}
            styles={customStyles}
            theme={(theme) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary25: primary2,
                primary: primary,
              },
            })}
            onChange={(res) => {
              setShowSince(res.value);
            }}
          />
        </div>

        <div style={styles.selectBlock}>
          <span style={styles.selectBlockText}>Autoload calls every</span>

          <Select
            style={styles.select}
            value={autoloadDelaySelectValue}
            options={delaySelect}
            styles={customStyles}
            theme={(theme) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary25: primary2,
                primary: primary,
              },
            })}
            onChange={(res) => {
              setAutoloadDelay(res.value);
            }}
          />
        </div>

        <div style={styles.selectBlock}>
          <span style={styles.selectBlockText}>Remove calls older than</span>

          <Select
            style={styles.select}
            value={removeBeforeSelectValue}
            options={timeSelect}
            styles={customStyles}
            theme={(theme) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary25: primary2,
                primary: primary,
              },
            })}
            onChange={(res) => {
              setRemoveBefore(res.value);
            }}
          />

          <Button
            title={'Remove'}
            onClick={async () => {
              if (
                window.confirm(
                  `Are you sure you want to delete calls older than ${removeBeforeSelectValue.label.props.children}?`,
                )
              ) {
                handleDeleteBefore(removeBefore);
              }
            }}
          />
        </div>

        <div style={styles.restoreBlock}>
          <div style={styles.restoreText}>
            Restore backup by uploading it below
          </div>
          <input
            type={'file'}
            onChange={(event) => {
              const fileReader = new FileReader();

              fileReader.onloadend = () => {
                if (
                  window.confirm('Are you sure you want to restore this data?')
                ) {
                  const data = fileReader.result;
                  writeLocalStorage(data);

                  window.location.reload();
                }
              };

              fileReader.readAsText(event.target.files[0]);
            }}
          />
        </div>

        <div style={styles.controls}>
          <div>
            <Button
              title={'Backup Data'}
              secondary={true}
              onClick={() => {
                const storage = getLocalStorage();

                download(
                  'Ham2Mon-Gui-Backup-' + new Date().toDateString() + '.bak',
                  storage,
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
