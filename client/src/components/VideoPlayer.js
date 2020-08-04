import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

class VideoPlayer extends React.Component {
  state = { currentSource: null }
  componentDidMount() {
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() { //console.log('onPlayerReady', this);
      window.video = this;
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const [{ src }] = this.props.sources;
    if (src === this.state.currentSource) return;
    this.setState({ currentSource: src });
    this.player.posterImage.setSrc(this.props.poster);
    this.player.src({
      src,
      type: 'video/mp4',
    });
    this.player.load();
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  render() {
    return (
      <div>	
        <div data-vjs-player>
          <video ref={ node => this.videoNode = node } className="video-js"></video>
        </div>
      </div>
    )
  }
}

export default VideoPlayer;