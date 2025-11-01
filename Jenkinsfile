pipeline {
  agent any
  options {
    timestamps()
    disableConcurrentBuilds()
  }

  // Usa el SonarScanner configurado en Manage Jenkins → Tools (nombre: SonarScanner)
  environment {
    SCANNER_HOME = tool 'SonarScanner'     // ← nombre EXACTO de tu Tool
    // Ruta al bin del scanner para no escribir la ruta completa
    PATH = "${SCANNER_HOME}/bin:${env.PATH}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        sh 'echo "Compilando proyecto..."'
      }
    }

    stage('Test') {
      steps {
        sh 'echo "Ejecutando tests..."'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonar') {        // ← nombre EXACTO del server Sonar
          sh '''
            echo "Ejecutando análisis en SonarQube..."
            sonar-scanner \
              -Dsonar.projectKey=jenkins-demo \
              -Dsonar.projectName=jenkins-demo \
              -Dsonar.sources=. \
              -Dsonar.host.url=$SONAR_HOST_URL
          '''
        }
      }
    }

    // Requiere Webhook desde SonarQube a Jenkins (http://TU_JENKINS/sonarqube-webhook/)
    stage('Quality Gate') {
      when { expression { return env.SONAR_HOST_URL != null } }
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Package') {
      steps {
        sh 'mkdir -p build && echo "artefacto-demo" > build/artifact.txt'
        archiveArtifacts artifacts: 'build/**', fingerprint: true
      }
    }
  }

  post {
    success {
      echo '✅ Pipeline completado con éxito'
    }
    failure {
      echo '❌ Pipeline falló'
    }
  }
}
