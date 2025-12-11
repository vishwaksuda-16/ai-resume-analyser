pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    bat 'docker build -t ai-resume-analyser:latest .'
                }
            }
        }

        stage('List Images') {
            steps {
                echo 'Verifying Docker Image...'
                bat 'docker images'
            }
        }
    }
}