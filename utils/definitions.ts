export const VIDEO_INPUT = "videoinput";

export const CAMERA_LOAD_STATUS_SUCCESS = 1;
export const CAMERA_LOAD_STATUS_ERROR = 2;
export const CAMERA_LOAD_STATUS_NO_DEVICES = 3;

export type CameraLoadStatus =
  | typeof CAMERA_LOAD_STATUS_SUCCESS
  | typeof CAMERA_LOAD_STATUS_ERROR
  | typeof CAMERA_LOAD_STATUS_NO_DEVICES
  | undefined;

export interface CameraDeviceStatus {
  status: CameraLoadStatus;
  errorMsg?: string;
  errorName?: string;
}

export interface CameraDeviceContext {
  status: CameraDeviceStatus;
  webcamId: string | undefined;
  setWebcamId: (id: string) => void;
  webcamList: MediaDeviceInfo[];
}

export const NO_MODE: number = -1;
export const OBJ_DETECTION_MODE: number = 0;
export const FACE_DETECTION_MODE: number = 1;
export const GESTURE_RECOGNITION_MODE: number = 2;
export const FACE_LANDMARK_DETECTION_MODE: number = 3;

export const CONFIG_SLIDER_STEP: number = 0.2;
export const VISION_URL: string = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

export type InterfaceDelegate = "CPU" | "GPU";
export const DELEGATE_GPU: InterfaceDelegate = "GPU";
export const DELEGATE_CPU: InterfaceDelegate = "CPU";

export type RunningMode = "IMAGE" | "VIDEO";
export const RUNNING_MODE_IMAGE: RunningMode = "IMAGE";
export const RUNNING_MODE_VIDEO: RunningMode = "VIDEO";

export const OBJECT_DETECTION_STR: string = "Object Detection";
export const FACE_DETECTION_STR: string = "Face Detection";
export const GESTURE_RECOGNITION_STR: string = "Gesture Recognition";
export const FACE_LANDMARK_DETECTION_STR: string = "Face Landmark Detection";

export type ModelLoadResult = {
    modelName: string;
    mode: number;
    loadResult: boolean;
};

export const ERROR_ENABLE_CAMERA_PERMISSION_MSG = "Please Enable Camera Permission";
export const ERROR_NO_CAMERA_DEVICE_AVAILABLE_MSG = "No Camera Device Available"; 