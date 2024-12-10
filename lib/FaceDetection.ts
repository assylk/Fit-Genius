import { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import Drawing3d from "./Drawing3d";

class FaceDetection {
  private static model: any;
  private static isUpdating: boolean = false;

  static async initModel(Vision: any) {
    this.isUpdating = true;
    try {
      const moduleFactory = await Vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      if (!moduleFactory) {
        throw new Error("ModuleFactory not initialized");
      }
      this.model = await Vision.FaceLandmarker.createFromOptions(Vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
          delegate: "GPU",
          moduleFactory: moduleFactory
        },
        runningMode: "VIDEO",
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
    } catch (err) {
      console.error('Error initializing face detection model:', err);
    }
    this.isUpdating = false;
  }

  static isModelUpdating() {
    return this.isUpdating;
  }

  static detectFace(video: HTMLVideoElement): FaceLandmarkerResult | null {
    if (!this.model) return null;
    try {
      return this.model.detectForVideo(video, performance.now());
    } catch (err) {
      console.error('Error detecting face:', err);
      return null;
    }
  }

  static draw(
    isFrontCamera: boolean,
    detections: FaceLandmarkerResult,
    videoWidth: number,
    videoHeight: number
  ) {
    if (!detections?.faceLandmarks?.[0]) return;
    
    Drawing3d.clearScene();
    Drawing3d.initScene(videoWidth, videoHeight);
    
    Drawing3d.drawLandmarks(
        detections.faceLandmarks[0],
        "#ffffff",
        videoWidth,
        videoHeight,
        isFrontCamera
    );
    
    Drawing3d.render();
  }
}

export default FaceDetection; 