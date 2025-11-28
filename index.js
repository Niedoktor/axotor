import { Input, ALL_FORMATS, UrlSource, VideoSampleSink } from './mediabunny.mjs';
import { nbdPoints } from "./points/test_B/test_B.js";
import { ImgWarper } from './imgwarp.min.js';

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

  let frameCount = 0;
  let imageData1 = null;
  let imageData2 = null;

  for await (const frame of samples) {
    //if(frameCount > 2){
      const canvas = document.createElement("canvas");
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      const ctx = canvas.getContext("2d");
      frame.draw(ctx, 0, 0);

      if(imageData1 !== null){
        imageData2 = ctx.getImageData(0, 0, displayWidth, displayHeight);

        const points1 = [new ImgWarper.Point(0, 0), new ImgWarper.Point(displayWidth, 0), new ImgWarper.Point(displayWidth, displayWidth), new ImgWarper.Point(0, displayWidth)];
        const points2 = [new ImgWarper.Point(0, 0), new ImgWarper.Point(displayWidth, 0), new ImgWarper.Point(displayWidth, displayWidth), new ImgWarper.Point(0, displayWidth)];
        const pt = nbdPoints[frameCount - 1];
        const r = displayWidth / 224;
        for(let i = 0; i < pt[0].length; i+=2){
          points1.push(new ImgWarper.Point(pt[0][i] * r, pt[0][i + 1] * r));
          points2.push(new ImgWarper.Point(pt[1][i] * r, pt[1][i + 1] * r));
        };
        
        const pointDefiner1 = {
          imgData: imageData1,
          oriPoints: points1
        };
        const pointDefiner2 = {
          imgData: imageData2,
          oriPoints: points2
        };

        const animator = new ImgWarper.Animator(pointDefiner1, pointDefiner2);
        animator.generate(10);

        animator.frames.forEach(animFrame => {
          const animCanvas = document.createElement("canvas");
          animCanvas.width = displayWidth;
          animCanvas.height = displayHeight;
          const animCtx = animCanvas.getContext("2d");
          animCtx.putImageData(animFrame, 0, 0);
          frames.push(animCanvas);
        });

        imageData1 = imageData2;
      }else{
        imageData1 = ctx.getImageData(0, 0, displayWidth, displayHeight);
      }
    //}
    frames.push(canvas);
    frame.close();
    frameCount++;
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