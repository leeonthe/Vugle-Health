import React, { useEffect } from 'react';

const DesktopView: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set the browser window to match the iPhone 15 Pro dimensions
      // window.resizeTo(393, 852);
      window.resizeTo(393, 852);

      window.moveTo(
        screen.width / 2 - 393 / 2, // Center horizontally
        screen.height / 2 - 852 / 2 // Center vertically
      );
    }
  }, []);

  return (
    <div style={styles.simulatorWrapper}>
      <div style={styles.simulator}>
        <h1>iOS Simulator-like Display</h1>
        <p>This is a fixed, non-resizable view</p>
      </div>
    </div>
  );
};

const styles = {
  simulatorWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  simulator: {
    width: '393px',
    height: '692px',

    // height: '852px',
    // width: '330px',
    // height: '400px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
};

export default DesktopView;
