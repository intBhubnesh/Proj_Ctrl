"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TeacherSetupPage() {
  const [formData, setFormData] = useState({
    domains: [] as string[],
    technologies: [] as string[],
    newDomain: "",
    newTechnology: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const predefinedDomains = [
    "Web Development", "Mobile App Development", "AI/ML", "Data Science",
    "Cybersecurity", "Cloud Computing", "IoT", "Blockchain", "Game Development"
  ]

  const predefinedTechnologies = [
    "React", "Angular", "Vue.js", "Node.js", "Python", "Java", "C++", "C#",
    "Flutter", "React Native", "TensorFlow", "PyTorch", "AWS", "Azure", "Docker"
  ]

  const addDomain = (domain: string) => {
    if (domain && !formData.domains.includes(domain)) {
      setFormData(prev => ({
        ...prev,
        domains: [...prev.domains, domain],
        newDomain: ""
      }))
    }
  }

  const addTechnology = (tech: string) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech],
        newTechnology: ""
      }))
    }
  }

  const removeDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.filter(d => d !== domain)
    }))
  }

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const handleSubmit = async () => {
    if (formData.domains.length === 0 || formData.technologies.length === 0) {
      alert("Please select at least one domain and one technology")
      return
    }

    setIsLoading(true)
    
    // TODO: Submit teacher expertise data
    console.log("Submitting teacher expertise:", formData)
    
    setTimeout(() => {
      setIsLoading(false)
      router.push("/teacher/dashboard")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Setup Your Expertise</h1>
          <p className="text-muted-foreground">
            Tell us about your domain expertise and technology knowledge
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Domains */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Expertise</CardTitle>
              <CardDescription>Select domains you can mentor students in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Quick Select</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedDomains.map((domain) => (
                    <Button
                      key={domain}
                      variant={formData.domains.includes(domain) ? "default" : "outline"}
                      size="sm"
                      onClick={() => addDomain(domain)}
                    >
                      {domain}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customDomain">Add Custom Domain</Label>
                <div className="flex gap-2">
                  <Input
                    id="customDomain"
                    placeholder="Enter domain name"
                    value={formData.newDomain}
                    onChange={(e) => setFormData(prev => ({ ...prev, newDomain: e.target.value }))}
                  />
                  <Button onClick={() => addDomain(formData.newDomain)}>Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selected Domains</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.domains.map((domain) => (
                    <div key={domain} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {domain}
                      <button
                        onClick={() => removeDomain(domain)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Knowledge</CardTitle>
              <CardDescription>Select technologies you are familiar with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Quick Select</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedTechnologies.map((tech) => (
                    <Button
                      key={tech}
                      variant={formData.technologies.includes(tech) ? "default" : "outline"}
                      size="sm"
                      onClick={() => addTechnology(tech)}
                    >
                      {tech}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customTech">Add Custom Technology</Label>
                <div className="flex gap-2">
                  <Input
                    id="customTech"
                    placeholder="Enter technology name"
                    value={formData.newTechnology}
                    onChange={(e) => setFormData(prev => ({ ...prev, newTechnology: e.target.value }))}
                  />
                  <Button onClick={() => addTechnology(formData.newTechnology)}>Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selected Technologies</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech) => (
                    <div key={tech} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {tech}
                      <button
                        onClick={() => removeTechnology(tech)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={handleSubmit}
            disabled={formData.domains.length === 0 || formData.technologies.length === 0 || isLoading}
            size="lg"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </div>
      </div>
    </div>
  )
}
