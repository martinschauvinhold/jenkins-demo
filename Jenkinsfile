/*
  Jenkinsfile - Demo Pipeline DevSecOps (Presentación)
  ----------------------------------------------------
  Flujo completo:
    1) Checkout del código
    2) Build (npm install)
    3) Tests (npm test)
    4) Análisis estático con SonarQube
    5) Quality Gate (sin cortar el pipeline)
    6) SAST con Semgrep
    7) SCA con Snyk
    8) DAST con OWASP ZAP
    9) Package (artefacto final)

  REQUISITOS EN EL AGENTE:
    - Node.js + npm
    - SonarScanner configurado como tool 'SonarScanner'
    - Servidor SonarQube configurado como 'sonar'
    - Semgrep instalado (ej: /home/ubuntu/.local/bin)
    - Snyk CLI instalado + credencial 'snyk-token' (Secret text)
    - Docker instalado (para OWASP ZAP)
*/

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    SCANNER_HOME = tool 'SonarScanner'
    PATH = "${SCANNER_HOME}/bin:${PATH}"
  }

  stages {

    // -------------------------------
    // 1. CHECKOUT
    // -------------------------------
    stage('Checkout') {
      steps {
        echo '📥 [CHECKOUT] Obteniendo código desde GitHub...'
        checkout scm
        sh 'ls -la'
      }
    }

    // -------------------------------
    // 2. BUILD
    // -------------------------------
    stage('Build') {
      steps {
        echo '🏗️ [BUILD] Instalando dependencias con npm...'
        sh '''
          echo ">>> npm install"
          npm install
        '''
      }
    }

    // -------------------------------
    // 3. TESTS
    // -------------------------------
    stage('Test') {
      steps {
        echo '🧪 [TEST] Ejecutando tests de la aplicación...'
        sh '''
          echo ">>> npm test"
          npm test || true
        '''
      }
    }

    // -------------------------------
    // 4. SONARQUBE
    // -------------------------------
    stage('SonarQube Analysis') {
      steps {
        echo '🔍 [SONARQUBE] Ejecutando análisis estático de código...'
        withSonarQubeEnv('sonar') {
          sh '''
            sonar-scanner \
              -Dsonar.projectKey=jenkins-demo \
              -Dsonar.projectName=jenkins-demo \
              -Dsonar.sources=. \
              -Dsonar.host.url=$SONAR_HOST_URL
          '''
        }
      }
    }

    // -------------------------------
    // 5. QUALITY GATE (NO CORTA)
    // -------------------------------
    stage('Quality Gate') {
      steps {
        echo '🚦 [QUALITY GATE] Consultando resultado del análisis en SonarQube...'
        timeout(time: 10, unit: 'MINUTES') {
          script {
            def qg = waitForQualityGate()
            echo "🚦 Resultado del Quality Gate: ${qg.status}"

            // IMPORTANTE PARA LA DEMO:
            // NO usamos abortPipeline:true, así aunque esté en ERROR
            // el pipeline continúa y podemos mostrar Semgrep, Snyk y ZAP.
          }
        }
      }
    }

    // -------------------------------
    // 6. SAST — SEMGREP
    // -------------------------------
    stage('SAST - Semgrep') {
      steps {
        echo '🛡️ [SAST] Ejecutando Semgrep sobre el código fuente...'
        sh '''
          # Aseguramos Semgrep en el PATH (ajustar si está en otra ruta)
          export PATH="$PATH:/home/ubuntu/.local/bin"

          mkdir -p reports

          echo ">>> semgrep --config=auto"
          semgrep --config=auto \
                  --json \
                  --output=reports/semgrep-report.json \
                  || true   # Para la demo, no rompemos el pipeline si hay findings
        '''
      }
      post {
        always {
          script {
            if (fileExists('reports/semgrep-report.json')) {
              echo '📄 [SAST] Reporte de Semgrep generado en reports/semgrep-report.json'
              archiveArtifacts artifacts: 'reports/semgrep-report.json', onlyIfSuccessful: false
            } else {
              echo '⚠ [SAST] Semgrep no generó reports/semgrep-report.json'
            }
          }
        }
      }
    }

    // -------------------------------
    // 7. SCA — SNYK
    // -------------------------------
    stage('SCA - Snyk') {
      steps {
        echo '📦 [SCA] Ejecutando Snyk sobre dependencias (package.json)...'
        withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
          sh '''
            mkdir -p reports
            export SNYK_TOKEN=${SNYK_TOKEN}

            echo ">>> snyk test --json"
            snyk test --json > reports/snyk-report.json || true
          '''
        }
      }
      post {
        always {
          script {
            if (fileExists('reports/snyk-report.json')) {
              echo '📄 [SCA] Reporte de Snyk generado en reports/snyk-report.json'
              archiveArtifacts artifacts: 'reports/snyk-report.json', onlyIfSuccessful: false
            } else {
              echo '⚠ [SCA] Snyk no generó reports/snyk-report.json'
            }
          }
        }
      }
    }

    // -------------------------------
    // 8. DAST — OWASP ZAP
    // -------------------------------
    stage('DAST - OWASP ZAP') {
      steps {
        echo '🌐 [DAST] Ejecutando OWASP ZAP contra testphp.vulnweb.com...'
        sh '''
          mkdir -p reports/zap

          echo ">>> docker run owasp/zap2docker-stable zap-full-scan.py ..."
          docker run --rm \
            -v $(pwd)/reports/zap:/zap/wrk/ \
            owasp/zap2docker-stable \
              zap-full-scan.py \
                -t http://testphp.vulnweb.com/ \
                -r zap-report.html \
              || true
        '''
      }
      post {
        always {
          script {
            if (fileExists('reports/zap/zap-report.html')) {
              echo '📄 [DAST] Reporte HTML de ZAP generado en reports/zap/zap-report.html'
              archiveArtifacts artifacts: 'reports/zap/zap-report.html', onlyIfSuccessful: false
            } else {
              echo '⚠ [DAST] ZAP no generó reports/zap/zap-report.html'
            }
          }
        }
      }
    }

    // -------------------------------
    // 9. PACKAGE
    // -------------------------------
    stage('Package') {
      steps {
        echo '📦 [PACKAGE] Generando artefacto final de demo...'
        sh '''
          mkdir -p build
          echo "artefacto-demo" > build/artifact.txt
        '''
        archiveArtifacts artifacts: 'build/**', fingerprint: true
      }
    }
  }

  post {
    success {
      echo '✅ [FIN] Pipeline completado con éxito (todas las herramientas ejecutadas).'
    }
    failure {
      echo '❌ [FIN] Pipeline finalizó con errores.'
    }
  }
}
