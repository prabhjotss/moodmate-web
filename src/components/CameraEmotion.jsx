import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

export default function CameraEmotion({ onSuggestion }) {
  const videoRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [expression, setExpression] = useState(null)

  useEffect(() => {
    async function setupCamera() {
      try {
        const MODEL_URL = '/models'
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)

        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = stream
        setLoaded(true)
      } catch (err) {
        console.error('Camera setup error:', err)
      }
    }
    setupCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  useEffect(() => {
    let intervalId
    async function detectFace() {
      if (!videoRef.current || videoRef.current.readyState !== 4) return

      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceExpressions()

      if (detection && detection.expressions) {
        const expressions = detection.expressions
        const top = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0]
        if (top) {
          const mood = top[0]
          setExpression(mood)
          const suggestion = suggestionForMood(mood)
          onSuggestion && onSuggestion(suggestion)
        }
      }
    }

    function startDetect() {
      intervalId = setInterval(detectFace, 800)
    }

    if (loaded) startDetect()
    return () => clearInterval(intervalId)
  }, [loaded])

  return (
    <div>
      <div className="video-wrap">
        <video ref={videoRef} autoPlay muted playsInline width={360} height={270} />
      </div>
      <div className="status">Expression: {expression || '—'}</div>
    </div>
  )
}

function suggestionForMood(mood) {
  const map = {
    happy: 'Keep doing what you are doing — try a 5-min gratitude exercise.',
    sad: 'Try a short breathing exercise or call a friend.',
    neutral: 'Take a quick walk or stretch to refresh your mind.',
    angry: 'Try box-breathing: 4-4-4-4 for two minutes to calm down.',
    surprised: 'Looks like something caught your attention — note it down!',
    fearful: 'Grounding exercise: name 5 things you see, 4 you can touch...',
    disgusted: 'Take a short break and sip water; reflect on the trigger.'
  }
  return map[mood] || 'Try a short breathing or grounding exercise.'
}
