class StreamManager {
  constructor(start) {
    this.start = start;

    this.status = 'IDLE';
    this.outputs = [];
  }


  addOutput(output) {
    this.outputs.push(output);
    if (this.status === 'IDLE') {
      this.status = 'WAITING';
      this.start();
    }
  }

  removeOutput(output) {
    console.log('removing output');
    const index = this.outputs.indexOf(output);
    if (index >= 0) {
      this.outputs.splice(index, 1);

      if (this.outputs.length === 0) {
        console.log('stopping input stream');

        this.stop();
        this.status = 'IDLE';
      }
    }
  }

  reset() {
    this.status = 'IDLE';
    this.stop = null;
    this.outputs = [];
  }

  setInput({input, stop}) {
    if (this.status === 'WAITING') {
      console.log('processing input stream');

      this.status = 'STREAMING';
      this.stop = stop;

      input.on('data', chunk => {
        this.outputs.forEach(output => {
          output.write(chunk);
          output.flushHeaders();
        });
      });

      input.on('end', () => {
        this.outputs.forEach(output => output.end());
      });
    }
  }
}

module.exports = StreamManager;
