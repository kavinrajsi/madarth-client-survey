// React and Next.js hooks
import { useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head";

// Supabase client for inserting data into the database
import { supabase } from "@/lib/supabase"

// UI components from your project
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Main Home page component
export default function Home() {
  const router = useRouter()

  // Form state holds input values
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    responses: {
      quality: "0",
      timeline: "0",
      brandAlignment: "0",
      communication: "0",
      feedback: "0",
      contribution: "0",
      trust: "0",
    },
    suggestions: "",
  })

  // Validation error state
  const [errors, setErrors] = useState({})

  // Submission loading state
  const [submitting, setSubmitting] = useState(false)

  // Survey questions (used to generate slider inputs)
  const questions = [
    { key: "quality", label: "How satisfied are you with the overall quality of the work delivered?" },
    { key: "timeline", label: "Were the timelines communicated and maintained effectively?" },
    { key: "brandAlignment", label: "How well did the creative output align with your brand expectations?" },
    { key: "communication", label: "How would you rate the clarity and responsiveness of our communication?" },
    { key: "feedback", label: "Did you feel your feedback was understood and acted upon thoughtfully?" },
    { key: "contribution", label: "Do you feel the creative work contributed to your marketing or business goals?" },
    { key: "trust", label: "I see Madarth as a trusted creative partner." }
  ]

  // Used to render the number scale under sliders
  const ratings = ["0", "1", "2", "3", "4", "5"]

  // Handles form input changes (both sliders and text inputs)
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name in formData.responses) {
      // Update a slider rating
      setFormData((prev) => ({
        ...prev,
        responses: { ...prev.responses, [name]: value },
      }))
    } else {
      // Update a text input
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Validates form inputs
  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email"

    // Ensure all sliders have a value
    for (let key in formData.responses) {
      if (!formData.responses[key]) newErrors[key] = "Required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return
    setSubmitting(true)

    // Save response to Supabase
    const { error } = await supabase.from("survey_responses").insert([
      {
        name: formData.name,
        email: formData.email,
        responses: formData.responses,
        suggestions: formData.suggestions,
      },
    ])

    setSubmitting(false)

    if (error) {
      console.error(error)
      alert("Submission failed.")
    } else {
      // Redirect to thank-you page
      router.push("/thank-you")
    }
  }

  // Returns a color based on slider value (0–5)
  const getSliderColor = (value) => {
    const colorMap = {
      "0": "#d1d5db",
      "1": "#FF0000",
      "2": "#FF8000",
      "3": "#FF8C00",
      "4": "#FFFF00",
      "5": "#22c55e",
    }
    return colorMap[value] || "#d1d5db"
  }

  return (
        <>
      <Head>
        <title>Madarth Client Survey</title>
        <meta
          name="description"
          content="Share your feedback on our creative work. This quick survey helps MadMe improve quality, timelines, and brand alignment."
        />
      </Head>

    <div className="dark bg-gray-100 bg-gray-900 min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Client Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <Label className="mb-2 block"  htmlFor="name">Name *</Label>
                <Input name="name" value={formData.name} onChange={handleChange} />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="md:col-span-1">
                <Label className="mb-2 block"  htmlFor="email">Email *</Label>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            {/* Render Each Survey Question as a Slider */}
            {questions.map(({ key, label }) => (
              <div key={key} className="relative group">
                <Label>{label}</Label>
                <div className="relative">
                  {/* Range Slider */}
                  <input
                    type="range"
                    name={key}
                    min="0"
                    max="5"
                    step="1"
                    value={formData.responses[key]}
                    onChange={handleChange}
                    className="w-full appearance-none h-2 rounded-lg outline-none transition duration-300"
                    style={{
                      background: `linear-gradient(to right, ${getSliderColor(formData.responses[key])} 0%, ${getSliderColor(formData.responses[key])} ${(formData.responses[key] / 5) * 100}%, #d1d5db ${(formData.responses[key] / 5) * 100}%, #d1d5db 100%)`
                    }}
                  />

                  {/* Tooltip (shown on hover) */}
                  <div
                    className="absolute -top-8 left-0 transform -translate-x-1/2 hidden group-hover:block animate-fade-in-up"
                    style={{
                      left: `${(formData.responses[key] / 5) * 100}%`,
                    }}
                  >
                    <div className="bg-black text-white text-xs px-2 py-1 rounded shadow">
                      {formData.responses[key]}
                    </div>
                  </div>
                </div>

                {/* Rating scale 0–5 under the slider */}
                <div className="flex justify-between text-sm text-gray-400 mt-2 px-1">
                  {ratings.map((rate) => (
                    <span key={rate}>{rate}</span>
                  ))}
                </div>

                {/* Validation error message */}
                {errors[key] && <p className="text-sm text-red-500">{errors[key]}</p>}
              </div>
            ))}

            {/* Suggestions text area */}
            <div>
              <Label className="mb-2 block"  htmlFor="suggestions">Suggestions</Label>
              <Textarea
                name="suggestions"
                value={formData.suggestions}
                onChange={handleChange}
                className="min-h-[150px]"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Animation for tooltip fade-in effect */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
     </>
  )
}
