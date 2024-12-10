import numpy as np
import tensorflow as tf
import mediapipe as mp
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import pandas as pd
import os
from datetime import datetime
import hashlib

class PoseFormChecker:
    def __init__(self):
        # Define key body landmarks for reference
        self.landmarks = {
            'NOSE': mp.solutions.pose.PoseLandmark.NOSE,
            'LEFT_SHOULDER': mp.solutions.pose.PoseLandmark.LEFT_SHOULDER,
            'RIGHT_SHOULDER': mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER,
            'LEFT_HIP': mp.solutions.pose.PoseLandmark.LEFT_HIP,
            'RIGHT_HIP': mp.solutions.pose.PoseLandmark.RIGHT_HIP,
            'LEFT_KNEE': mp.solutions.pose.PoseLandmark.LEFT_KNEE,
            'RIGHT_KNEE': mp.solutions.pose.PoseLandmark.RIGHT_KNEE,
            'LEFT_ANKLE': mp.solutions.pose.PoseLandmark.LEFT_ANKLE,
            'RIGHT_ANKLE': mp.solutions.pose.PoseLandmark.RIGHT_ANKLE,
            'LEFT_ELBOW': mp.solutions.pose.PoseLandmark.LEFT_ELBOW,
            'RIGHT_ELBOW': mp.solutions.pose.PoseLandmark.RIGHT_ELBOW,
            'LEFT_WRIST': mp.solutions.pose.PoseLandmark.LEFT_WRIST,
            'RIGHT_WRIST': mp.solutions.pose.PoseLandmark.RIGHT_WRIST
        }

    def check_form(self, landmarks, exercise_type):
        """Form analysis for different exercises"""
        if exercise_type.lower() == 'squat':
            return self.check_squat_form(landmarks)
        elif exercise_type.lower() == 'deadlift':
            return self.check_deadlift_form(landmarks)
        else:
            return {
                'total_issues': 0,
                'issues': [],
                'form_score': 100
            }

    def check_squat_form(self, landmarks):
        """Comprehensive form analysis for squats"""
        form_issues = []
        
        # Check knee alignment
        knee_hip_alignment = self._check_knee_hip_alignment(landmarks)
        if knee_hip_alignment:
            form_issues.append(knee_hip_alignment)
        
        # Check back angle
        back_angle = self._check_back_angle(landmarks)
        if back_angle:
            form_issues.append(back_angle)
        
        # Check depth
        depth = self._check_squat_depth(landmarks)
        if depth:
            form_issues.append(depth)
        
        return {
            'total_issues': len(form_issues),
            'issues': form_issues,
            'form_score': max(100 - (len(form_issues) * 15), 0)
        }

    def check_deadlift_form(self, landmarks):
        """Comprehensive form analysis for deadlifts"""
        form_issues = []
        
        # Check back straightness
        back_straight = self._check_back_straightness(landmarks)
        if back_straight:
            form_issues.append(back_straight)
        
        # Check bar path
        bar_path = self._check_bar_path(landmarks)
        if bar_path:
            form_issues.append(bar_path)
        
        # Check hip hinge
        hip_hinge = self._check_hip_hinge(landmarks)
        if hip_hinge:
            form_issues.append(hip_hinge)
        
        return {
            'total_issues': len(form_issues),
            'issues': form_issues,
            'form_score': max(100 - (len(form_issues) * 15), 0)
        }

    def _check_knee_hip_alignment(self, landmarks):
        left_knee = landmarks[self.landmarks['LEFT_KNEE']]
        right_knee = landmarks[self.landmarks['RIGHT_KNEE']]
        left_hip = landmarks[self.landmarks['LEFT_HIP']]
        right_hip = landmarks[self.landmarks['RIGHT_HIP']]
        
        if abs(left_knee.x - left_hip.x) > 0.1 or abs(right_knee.x - right_hip.x) > 0.1:
            return "Knees are not aligned with hips"
        return None

    def _check_back_angle(self, landmarks):
        # Calculate back angle relative to vertical
        spine_angle = self._calculate_angle(
            landmarks[self.landmarks['NOSE']],
            landmarks[self.landmarks['LEFT_HIP']],
            landmarks[self.landmarks['LEFT_KNEE']]
        )
        if spine_angle < 45:
            return "Back is leaning too far forward"
        return None

    def _check_squat_depth(self, landmarks):
        left_hip = landmarks[self.landmarks['LEFT_HIP']]
        left_knee = landmarks[self.landmarks['LEFT_KNEE']]
        
        if left_hip.y - left_knee.y < 0.1:  # Threshold for parallel
            return "Squat depth not reaching parallel"
        return None

    def _calculate_angle(self, point1, point2, point3):
        """Calculate angle between three points"""
        a = np.array([point1.x, point1.y])
        b = np.array([point2.x, point2.y])
        c = np.array([point3.x, point3.y])
        
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(cosine_angle)
        
        return np.degrees(angle)

    def _check_back_straightness(self, landmarks):
        """Check if the back is straight during deadlift"""
        shoulders = (landmarks[self.landmarks['LEFT_SHOULDER']], 
                    landmarks[self.landmarks['RIGHT_SHOULDER']])
        hips = (landmarks[self.landmarks['LEFT_HIP']], 
                landmarks[self.landmarks['RIGHT_HIP']])
        
        # Calculate average positions
        shoulder_y = (shoulders[0].y + shoulders[1].y) / 2
        hip_y = (hips[0].y + hips[1].y) / 2
        
        # Check if back is relatively straight (shoulders aligned with hips)
        if abs(shoulder_y - hip_y) > 0.15:  # Threshold for back alignment
            return "Keep your back straight"
        return None

    def _check_bar_path(self, landmarks):
        """Check if the bar path is vertical during deadlift"""
        wrists = (landmarks[self.landmarks['LEFT_WRIST']], 
                 landmarks[self.landmarks['RIGHT_WRIST']])
        shoulders = (landmarks[self.landmarks['LEFT_SHOULDER']], 
                    landmarks[self.landmarks['RIGHT_SHOULDER']])
        
        # Calculate average positions
        wrist_x = (wrists[0].x + wrists[1].x) / 2
        shoulder_x = (shoulders[0].x + shoulders[1].x) / 2
        
        # Check if bar path is vertical (wrists aligned with shoulders)
        if abs(wrist_x - shoulder_x) > 0.1:  # Threshold for bar path
            return "Keep the bar close to your body"
        return None

    def _check_hip_hinge(self, landmarks):
        """Check proper hip hinge movement in deadlift"""
        hips = landmarks[self.landmarks['LEFT_HIP']]
        knees = landmarks[self.landmarks['LEFT_KNEE']]
        shoulders = landmarks[self.landmarks['LEFT_SHOULDER']]
        
        # Calculate hip hinge angle
        hip_angle = self._calculate_angle(shoulders, hips, knees)
        
        if hip_angle < 45:  # Threshold for proper hip hinge
            return "Initiate the movement with your hips"
        return None

class DataCollector:
    def __init__(self):
        self.data_buffer = {
            'squat': [],
            'deadlift': []
        }
        self.user_info = None
        self.dataset_filenames = {
            'squat': 'squat_dataset.csv',
            'deadlift': 'deadlift_dataset.csv'
        }
        
    def set_user_info(self, info):
        self.user_info = info
        
    def add_frame_data(self, landmarks, exercise_type, position):
        """Add frame data to buffer"""
        if not self.user_info:
            return
            
        # Flatten landmarks into a single row
        row_data = []
        for landmark in landmarks:
            row_data.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
            
        # Add position, exercise type, and user info
        row_data.extend([
            position,
            exercise_type,  # Add exercise type to the data
            self.user_info['age'],
            self.user_info['gender'],
            self.user_info['height'],
            self.user_info['weight'],
            self.user_info['fitnessLevel']
        ])
        
        self.data_buffer[exercise_type].append(row_data)
    
    def _clean_and_balance_data(self, data, columns):
        """Clean and balance the dataset to have equal up/down positions for each exercise type"""
        df = pd.DataFrame(data, columns=columns)
        
        # Group by exercise type and position
        grouped = df.groupby(['exercise_type', 'position'])
        
        balanced_dfs = []
        for exercise in df['exercise_type'].unique():
            exercise_data = df[df['exercise_type'] == exercise]
            up_positions = exercise_data[exercise_data['position'] == 'up']
            down_positions = exercise_data[exercise_data['position'] == 'down']
            
            # Balance up/down positions for each exercise
            min_count = min(len(up_positions), len(down_positions))
            balanced_up = up_positions.head(min_count)
            balanced_down = down_positions.head(min_count)
            
            balanced_dfs.append(pd.concat([balanced_up, balanced_down]))
        
        # Combine all balanced exercise data
        balanced_df = pd.concat(balanced_dfs)
        return balanced_df.sample(frac=1).reset_index(drop=True)
    
    def save_to_csv(self, exercise_type):
        """Save collected data to CSV with cleaning and balancing"""
        if not self.data_buffer[exercise_type]:
            return
            
        # Create columns for landmarks
        columns = []
        for i in range(33):
            for coord in ['x', 'y', 'z', 'visibility']:
                columns.append(f'Landmark_{i+1}_{coord}')
                
        columns.extend(['position', 'exercise_type', 'age', 'gender', 'height', 'weight', 'level', 'session_id'])
        
        # Create session ID
        session_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hashlib.md5(str(self.user_info).encode()).hexdigest()}"
        
        # Add session_id to each row in the buffer
        for row in self.data_buffer[exercise_type]:
            row.append(session_id)
        
        # Clean and balance the dataset
        balanced_df = self._clean_and_balance_data(self.data_buffer[exercise_type], columns)
        
        # Create directory if it doesn't exist
        os.makedirs('collected_data', exist_ok=True)
        
        filename = f'collected_data/{self.dataset_filenames[exercise_type]}'
        
        # If file exists, append to it; otherwise create new
        if os.path.exists(filename):
            existing_df = pd.read_csv(filename)
            combined_df = pd.concat([existing_df, balanced_df])
            
            # Remove duplicates based on landmarks and session_id
            combined_df = combined_df.drop_duplicates(subset=[col for col in combined_df.columns 
                                                            if col.startswith('Landmark_') or col == 'session_id'])
            
            combined_df.to_csv(filename, index=False)
        else:
            balanced_df.to_csv(filename, index=False)
        
        # Clear buffer for this exercise type
        self.data_buffer[exercise_type] = []
        
        return filename

# Global variables
models = {}
form_checker = None
frame_buffer = []
rep_count = 0
final_rep_count = 0
previous_label = ""
label = "default"
current_form_score = 100
data_collector = None

# Flask App
app = Flask(__name__)
CORS(app)

def initialize_models():
    global models, form_checker, data_collector
    models = {
        'squat': tf.keras.models.load_model('model/pose_lstm_model_squats.h5'),
        'deadlift': tf.keras.models.load_model('model/pose_lstm_model_deadlift.h5')
    }
    form_checker = PoseFormChecker()
    data_collector = DataCollector()

@app.route('/analyze_frame', methods=['POST', 'OPTIONS'])
def analyze_frame():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    global frame_buffer, rep_count, final_rep_count, previous_label, label, current_form_score

    data = request.json
    image_data = data.get('image')
    exercise_type = data.get('exercise_type', 'squat').lower()
    
    if exercise_type not in models:
        return jsonify({'error': 'Invalid exercise type'})

    # Decode base64 image
    image_bytes = base64.b64decode(image_data.split(',')[1])
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    mp_pose = mp.solutions.pose
    
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)

        if results.pose_landmarks:
            # Extract pose landmarks
            pose_data = np.array([[res.x, res.y, res.z, res.visibility] 
                                for res in results.pose_landmarks.landmark]).flatten()
            
            frame_buffer.append(pose_data)
            if len(frame_buffer) > 10:
                frame_buffer.pop(0)
            
            form_analysis = form_checker.check_form(results.pose_landmarks.landmark, exercise_type)
            current_form_score = form_analysis['form_score']
            
            if len(frame_buffer) == 10:
                pose_sequence = np.array(frame_buffer).reshape(1, 10, 132)
                prediction = models[exercise_type].predict(pose_sequence)
                
                previous_label = label
                label = "up" if prediction[0][0] > 0.5 else "down"
                
                if previous_label == "down" and label == "up":
                    rep_count += 1
                    final_rep_count = rep_count
            
            # Pass exercise_type to add_frame_data
            if label in ['up', 'down']:
                data_collector.add_frame_data(
                    results.pose_landmarks.landmark,
                    exercise_type,
                    label
                )
            
            response = {
                'prediction': label,
                'reps': final_rep_count,
                'form_score': current_form_score,
                'form_issues': form_analysis['issues']
            }
            
            return jsonify(response)
        
        return jsonify({
            'error': 'No pose landmarks detected',
            'prediction': None,
            'reps': final_rep_count,
            'form_score': current_form_score
        })

@app.route('/reset', methods=['POST'])
def reset_counter():
    global rep_count, final_rep_count, frame_buffer
    rep_count = 0
    final_rep_count = 0
    frame_buffer = []
    return jsonify({'status': 'reset successful'})

@app.route('/set_user_info', methods=['POST'])
def set_user_info():
    data = request.json
    data_collector.set_user_info(data)
    return jsonify({'status': 'success'})

@app.route('/save_exercise_data', methods=['POST'])
def save_exercise_data():
    # Save data for all exercise types that have data in the buffer
    saved_files = []
    for exercise_type in data_collector.data_buffer.keys():
        if data_collector.data_buffer[exercise_type]:  # Only save if there's data
            filename = data_collector.save_to_csv(exercise_type)
            saved_files.append({
                'exercise_type': exercise_type,
                'filename': filename
            })
    
    if not saved_files:
        return jsonify({'error': 'No exercise data to save'})
        
    return jsonify({
        'status': 'success',
        'saved_files': saved_files
    })

def main():
    initialize_models()
    app.run(debug=True, port=5000)

if __name__ == "__main__":
    main() 