import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { GlobalUser, UserProfileUpdate, UserCertification, EmergencyContact, UserAddress, SocialLink } from '@/types/erp'
import { Plus, X, FloppyDisk, MapPin, Phone, Envelope, Calendar, Building } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ProfileBasicInfoProps {
  profile: GlobalUser
  onUpdate: (updates: UserProfileUpdate) => Promise<boolean>
  isLoading: boolean
}

export function ProfileBasicInfo({ profile, onUpdate, isLoading }: ProfileBasicInfoProps) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone || '',
    bio: '',
    job_title: '',
    department: '',
    skills: [] as string[],
    certifications: [] as UserCertification[],
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: ''
    } as EmergencyContact,
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      type: 'home' as const
    } as UserAddress,
    social_links: [] as SocialLink[]
  })

  const [newSkill, setNewSkill] = useState('')
  const [newSocialLink, setNewSocialLink] = useState({ platform: 'linkedin' as const, url: '', is_public: true })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentData = prev[parent as keyof typeof prev] as Record<string, any>
      return {
        ...prev,
        [parent]: {
          ...parentData,
          [field]: value
        }
      }
    })
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addSocialLink = () => {
    if (newSocialLink.url.trim()) {
      setFormData(prev => ({
        ...prev,
        social_links: [...prev.social_links, { ...newSocialLink, url: newSocialLink.url.trim() }]
      }))
      setNewSocialLink({ platform: 'linkedin', url: '', is_public: true })
    }
  }

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const updates: UserProfileUpdate = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      job_title: formData.job_title,
      department: formData.department,
      bio: formData.bio,
      skills: formData.skills,
      certifications: formData.certifications,
      emergency_contact: formData.emergency_contact,
      address: formData.address,
      social_links: formData.social_links
    }

    const success = await onUpdate(updates)
    if (success) {
      toast.success('Profile updated successfully')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building size={20} />
            Basic Information
          </CardTitle>
          <CardDescription>
            Update your personal and professional information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Engineering"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Expertise</CardTitle>
          <CardDescription>
            Add your professional skills and areas of expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              <Plus size={16} />
            </Button>
          </div>
          
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSkill(skill)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} />
            Contact Information
          </CardTitle>
          <CardDescription>
            Your address and emergency contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address */}
          <div className="space-y-4">
            <h4 className="font-medium">Address</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                    placeholder="NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.address.postal_code}
                    onChange={(e) => handleNestedChange('address', 'postal_code', e.target.value)}
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="font-medium">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_name">Full Name</Label>
                <Input
                  id="emergency_name"
                  value={formData.emergency_contact.name}
                  onChange={(e) => handleNestedChange('emergency_contact', 'name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_relationship">Relationship</Label>
                <Input
                  id="emergency_relationship"
                  value={formData.emergency_contact.relationship}
                  onChange={(e) => handleNestedChange('emergency_contact', 'relationship', e.target.value)}
                  placeholder="Spouse, Parent, Sibling"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Phone Number</Label>
                <Input
                  id="emergency_phone"
                  type="tel"
                  value={formData.emergency_contact.phone}
                  onChange={(e) => handleNestedChange('emergency_contact', 'phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_email">Email (Optional)</Label>
                <Input
                  id="emergency_email"
                  type="email"
                  value={formData.emergency_contact.email}
                  onChange={(e) => handleNestedChange('emergency_contact', 'email', e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>
            Add your professional social media profiles and websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={newSocialLink.platform}
              onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value as any }))}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="github">GitHub</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
            <Input
              placeholder="Enter URL..."
              value={newSocialLink.url}
              onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addSocialLink}>
              <Plus size={16} />
            </Button>
          </div>

          {formData.social_links.length > 0 && (
            <div className="space-y-2">
              {formData.social_links.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{link.platform}</Badge>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-primary hover:underline"
                    >
                      {link.url}
                    </a>
                    {link.is_public && <Badge variant="secondary" className="text-xs">Public</Badge>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialLink(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
          <FloppyDisk size={16} />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}