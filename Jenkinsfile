pipeline {
  agent any
  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    SCANNER_HOME = tool 'SonarScanner'
    PATH = "${SCANNER_HOME}/bin:${env.PATH}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
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
        withSonarQubeEnv('sonar') {
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

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    // ----------------------------------------------------
    // 🚀 NUEVO STAGE — SAST con Semgrep (usando Git)
    // ----------------------------------------------------
  stage('SAST - Semgrep') {
  steps {
    sh '''
      echo "Ejecutando Semgrep (SAST)..."
      # Agregamos el Semgrep de ubuntu al PATH para el usuario jenkins
      export PATH="$PATH:/home/ubuntu/.local/bin"

      mkdir -p reports

      semgrep --config=auto \
              --json \
              --output=reports/semgrep-report.json \
              || true
    '''
  }
  post {
    always {
      script {
        if (fileExists('reports/semgrep-report.json')) {
          archiveArtifacts artifacts: 'reports/semgrep-report.json', onlyIfSuccessful: false
        } else {
          echo '⚠ Semgrep no generó reports/semgrep-report.json (revisar stage SAST).'
        }
      }
    }
  }
}

    // ----------------------------------------------------

    stage('Package') {
      steps {
        sh 'mkdir -p build && echo "artefacto-demo" > build/artifact.txt'
        archiveArtifacts artifacts: 'build/**', fingerprint: true
      }
    }
  }

  post {
    success { echo '✅ Pipeline completado con éxito' }
    failure { echo '❌ Pipeline falló' }
  }
}
