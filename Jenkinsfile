//Test for Github Webhook - SCM Polling

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
                bat 'docker build -t vishwak16/ai-resume-analyser:v1 .'
                bat 'docker tag vishwak16/ai-resume-analyser:v1 vishwak16/ai-resume-analyser:latest'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing to Docker Hub...'
                bat 'docker push vishwak16/ai-resume-analyser:v1'
                bat 'docker push vishwak16/ai-resume-analyser:latest'
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes...'
                bat 'kubectl set image deployment/ai-resume-analyser ai-resume-analyser=vishwak16/ai-resume-analyser:v1'
                bat 'kubectl rollout status deployment/ai-resume-analyser'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}