# FitGenius

A powerful AI-powered fitness application that helps users track their workouts, get personalized recommendations, and achieve their fitness goals.

## Project Overview

FitGenius is an intelligent fitness companion that leverages artificial intelligence to provide personalized workout plans, track progress, and offer real-time feedback on exercise form. The application uses advanced machine learning algorithms to adapt to each user's fitness level and goals.

## Prerequisites

Before running this project, make sure you have the following installed:

1. **Anaconda**
   - Download and install [Anaconda](https://www.anaconda.com/download)
   - This will provide you with Python and conda package manager

2. **Python Dependencies**
   - Flask framework and other required packages
   - Create a conda environment using the provided environment.yml file

## Installation

1. Clone the repository:
```bash
git clone https://github.com/assylk/AI-Coach-Assistant-A-Deep-Learning-Powered-Coaching-Platform-Built-with-Next.js.git

cd AI-Coach-Assistant-A-Deep-Learning-Powered-Coaching-Platform-Built-with-Next.js
```

2. Create and activate the conda environment:
```bash
conda env create -f environment.yml
conda activate fitgenius
```

3. Install additional dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## Features

- 🏋️‍♂️ Personalized workout plans
- 📊 Progress tracking and analytics
- 🎯 Goal setting and monitoring
- 🤖 AI-powered form correction
- 📱 Responsive design for mobile and desktop

## Project Structure

```
fitgenius/
├── app.py              # Main Flask application
├── models/            # ML models and data processing
├── static/            # CSS, JavaScript, and images
├── templates/         # HTML templates
├── requirements.txt   # Python dependencies
└── environment.yml    # Conda environment configuration
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
