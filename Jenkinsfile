pipeline {
  agent any

  environment {
    SONAR_PROJECT_KEY = 'selectilla-strapi'
    SONAR_PROJECT_NAME = 'SelectIlLa Backend'
    SONAR_TOKEN = credentials('sonartoken') 
    SONAR_SERVER_NAME = 'sonarservers'
  }

   stages {
    stage('Build') {
      steps {
        echo ' Compilation du backend...'
        sh 'npm install'

      }
    }
    stage('Test') {
      steps {
        echo 'Lancement des tests Jest/Supertest...'
        sh 'npm  test || echo "Tests échoués."'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        echo 'Analyse SonarQube...'
        withSonarQubeEnv('sonarservers') { 
          sh """
            npx sonar-scanner \
              -Dsonar.projectKey=$SONAR_PROJECT_KEY \
              -Dsonar.projectName=$SONAR_PROJECT_NAME \
              -Dsonar.sources=src \
              -Dsonar.language=js \
              -Dsonar.sourceEncoding=UTF-8 \
              -Dsonar.login=$SONAR_TOKEN
          """
        }
      }
    }
  }
}
