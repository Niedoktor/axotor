import { Input, ALL_FORMATS, UrlSource, VideoSampleSink } from './mediabunny.mjs';

export const frames = [];

export async function loadVideoFrames() {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource('files/test_A_50proc.webm')
  });

  const videoTrack = await input.getPrimaryVideoTrack();
  const { displayWidth, displayHeight } = videoTrack;

  const sink = new VideoSampleSink(videoTrack);

  const samples = sink.samples();

  for await (const frame of samples) {
    const canvas = document.createElement("canvas");
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    const ctx = canvas.getContext("2d");
    frame.draw(ctx, 0, 0);
    frames.push(canvas);
    frame.close();
  }
  console.log(`Loaded ${frames.length} frames`);

  input.dispose();
  
  // async function getVideoTrack() {
  //   const video = document.createElement("video");
  //   video.crossOrigin = "anonymous";
  //   video.src = "files/test_B_100proc.webm";
  //   video.muted = true;
  //   video.playsInline = true;
  //   video.style.display = "none";
  //   document.body.append(video);
  //   await video.play();
  //   const [track] = video.captureStream().getVideoTracks();
  //   video.onended = (evt) => track.stop();
  //   return track;
  // }

  // async function getVideoFrames({src, onFrame, onConfig}) {
  //   const track = await getVideoTrack();
  //   const processor = new MediaStreamTrackProcessor({track});
  //   const reader = processor.readable.getReader();

  //   let configCalled = false;

  //   async function read() {
  //     const result = await reader.read();
  //     if (result.done) {
  //       return;
  //     }
  //     const frame = result.value;
  //     if (!configCalled) {
  //       onConfig({
  //         codedWidth: frame.codedWidth,
  //         codedHeight: frame.codedHeight,
  //         format: frame.format,
  //         timestamp: frame.timestamp,
  //       });
  //       configCalled = true;
  //     }
  //     onFrame(frame);
  //     read();
  //   }
  //   read();
  // }

  // async function loadFrames() {
  //   await getVideoFrames({
  //     src: "files/test_B_100proc.webm",
  //     onConfig: (config) => {
  //       console.log("Video config:", config);
  //     },
  //     onFrame: (videoFrame) => {
  //       const canvas = document.createElement("canvas");
  //       canvas.width = videoFrame.codedWidth;
  //       canvas.height = videoFrame.codedHeight;
  //       const ctx = canvas.getContext("2d");
  //       ctx.drawImage(videoFrame, 0, 0);
  //       frames.push(canvas);
  //       videoFrame.close();
  //       if (frames.length % 30 === 0) {
  //         console.log(`Loaded ${frames.length} frames`);
  //       }
  //     },
  //   });
  // }
}