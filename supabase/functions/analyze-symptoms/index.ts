import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rule-based symptom analysis engine
const analyzeSymptoms = (input: string, type: 'text' | 'voice' | 'image'): any => {
  const symptoms: string[] = []
  const recommendations: string[] = []
  let severity: 'low' | 'medium' | 'high' = 'low'
  let urgency = false

  // Convert input to lowercase for analysis
  const text = input.toLowerCase()

  // Define symptom patterns and their severity
  const symptomPatterns = {
    high: [
      { pattern: /(chest pain|heart attack|cardiac|stroke|seizure|unconscious|breathing|difficulty breathing)/i, symptoms: ['Chest Pain', 'Cardiac Issues', 'Breathing Difficulty'] },
      { pattern: /(severe bleeding|hemorrhage|blood loss|trauma)/i, symptoms: ['Severe Bleeding', 'Trauma'] },
      { pattern: /(high fever|temperature above|104|40 celsius)/i, symptoms: ['High Fever'] }
    ],
    medium: [
      { pattern: /(fever|temperature|chills|flu|infection)/i, symptoms: ['Fever', 'Possible Infection'] },
      { pattern: /(headache|migraine|head pain)/i, symptoms: ['Headache'] },
      { pattern: /(nausea|vomiting|stomach|abdominal pain)/i, symptoms: ['Digestive Issues', 'Nausea'] },
      { pattern: /(dizziness|lightheaded|vertigo)/i, symptoms: ['Dizziness'] },
      { pattern: /(rash|skin|itching|allergic)/i, symptoms: ['Skin Issues', 'Possible Allergic Reaction'] }
    ],
    low: [
      { pattern: /(tired|fatigue|exhausted|sleepy)/i, symptoms: ['Fatigue'] },
      { pattern: /(cough|throat|cold|runny nose)/i, symptoms: ['Cold Symptoms', 'Respiratory Issues'] },
      { pattern: /(muscle pain|ache|soreness)/i, symptoms: ['Muscle Pain'] },
      { pattern: /(joint pain|arthritis|stiff)/i, symptoms: ['Joint Pain'] }
    ]
  }

  // Analyze symptoms based on patterns
  for (const [severityLevel, patterns] of Object.entries(symptomPatterns)) {
    for (const { pattern, symptoms: patternSymptoms } of patterns) {
      if (pattern.test(text)) {
        symptoms.push(...patternSymptoms)
        severity = severityLevel as 'low' | 'medium' | 'high'
        if (severityLevel === 'high') {
          urgency = true
        }
      }
    }
  }

  // Generate recommendations based on severity
  if (urgency) {
    recommendations.push('Seek immediate medical attention')
    recommendations.push('Call emergency services if symptoms worsen')
    recommendations.push('Do not drive yourself to the hospital')
  } else if (severity === 'medium') {
    recommendations.push('Schedule an appointment with your healthcare provider')
    recommendations.push('Monitor symptoms and seek immediate care if they worsen')
    recommendations.push('Stay hydrated and get adequate rest')
  } else {
    recommendations.push('Monitor symptoms for changes')
    recommendations.push('Ensure adequate rest and hydration')
    recommendations.push('Consider over-the-counter remedies if appropriate')
    recommendations.push('Consult healthcare provider if symptoms persist beyond a few days')
  }

  // Default symptoms if none detected
  if (symptoms.length === 0) {
    symptoms.push('General symptoms requiring evaluation')
    recommendations.push('Provide more specific symptom details for better analysis')
  }

  return {
    symptoms: [...new Set(symptoms)], // Remove duplicates
    severity,
    recommendations,
    urgency
  }
}

// Process voice input (convert to text first)
const processVoiceInput = async (base64Audio: string): Promise<string> => {
  // Placeholder for voice-to-text conversion
  // In a real implementation, you would:
  // 1. Convert base64 to audio blob
  // 2. Send to speech-to-text service (OpenAI Whisper, Google Speech-to-Text, etc.)
  // 3. Return transcribed text
  
  // For demo purposes, return placeholder text
  return "Patient reported symptoms via voice recording - fever, headache, and fatigue lasting 2 days"
}

// Process image input
const processImageInput = async (base64Images: string[]): Promise<string> => {
  // Placeholder for image analysis
  // In a real implementation, you would:
  // 1. Convert base64 to image data
  // 2. Send to medical image analysis service
  // 3. Extract visible symptoms, conditions, etc.
  // 4. Return description of findings
  
  // For demo purposes, return placeholder analysis
  return `Analysis of ${base64Images.length} medical image(s) - visible skin condition with redness and inflammation`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, input } = await req.json()

    if (!type || !input) {
      throw new Error('Type and input are required')
    }

    let processedInput = input

    // Process different input types
    switch (type) {
      case 'text':
        processedInput = input
        break
      
      case 'voice':
        processedInput = await processVoiceInput(input)
        break
      
      case 'image':
        processedInput = await processImageInput(input)
        break
      
      default:
        throw new Error('Invalid input type')
    }

    // Analyze the processed input
    const analysis = analyzeSymptoms(processedInput, type)

    // Log analysis for debugging
    console.log('Analysis completed:', {
      type,
      inputLength: processedInput.length,
      analysis
    })

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Analysis error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})