'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon as _PhotoIcon,
  XMarkIcon,
  CheckIcon,
  CameraIcon,
} from '@heroicons/react/24/outline'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { CATEGORIES, SUBCATEGORIES, MAX_IMAGES_PER_LISTING, MAX_FILE_SIZE } from '@/lib/constants'
import type { CreateListingData } from '@/lib/types'

interface CreateListingWizardProps {
  currentStep: number
  onStepChange: (step: number) => void
  onComplete: (data: CreateListingData) => void
  isSubmitting: boolean
}

const STEPS = [
  { title: 'Basic Info', description: 'Title and description' },
  { title: 'Category', description: 'What are you selling?' },
  { title: 'Pricing', description: 'Set your price' },
  { title: 'Photos', description: 'Add up to 6 images' },
  { title: 'Details', description: 'Size and weight info' },
  { title: 'Review', description: 'Confirm and publish' },
]

export const CreateListingWizard = ({
  currentStep,
  onStepChange,
  onComplete,
  isSubmitting
}: CreateListingWizardProps) => {
  const [formData, setFormData] = useState<CreateListingData>({
    title: '',
    description: '',
    category: 'Electronics',
    subcategory: '',
    price: 0,
    firm: false,
    images: [],
    size: 'carry',
    weight: '',
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MotionDiv = motion.div as React.ElementType

  const updateFormData = (field: keyof CreateListingData, value: string | number | boolean | File[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0:
        if (!formData.title.trim()) newErrors.title = 'Title is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters'
        if (formData.description.length > 1000) newErrors.description = 'Description must be less than 1000 characters'
        break
      case 1:
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.subcategory) newErrors.subcategory = 'Subcategory is required'
        break
      case 2:
        if (formData.price <= 0) newErrors.price = 'Price must be greater than $0'
        if (formData.price > 10000) newErrors.price = 'Price must be less than $10,000'
        break
      case 3:
        // Images are optional
        break
      case 4:
        if (!formData.size) newErrors.size = 'Size category is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      onStepChange(currentStep + 1)
    }
  }

  const handleBack = () => {
    onStepChange(currentStep - 1)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (formData.images.length + files.length > MAX_IMAGES_PER_LISTING) {
      setErrors({ images: `Maximum ${MAX_IMAGES_PER_LISTING} images allowed` })
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setErrors({ images: 'Each image must be less than 5MB' })
        return false
      }
      if (!file.type.startsWith('image/')) {
        setErrors({ images: 'Please select only image files' })
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      const newImages = [...formData.images, ...validFiles]
      const newPreviews = [...imagePreviews]

      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string)
          setImagePreviews([...newPreviews])
        }
        reader.readAsDataURL(file)
      })

      updateFormData('images', newImages)
      setErrors({ images: '' })
    }
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    updateFormData('images', newImages)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = () => {
    if (validateStep(4)) {
      onComplete(formData)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Input
              label="Title"
              placeholder="What are you selling?"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              error={errors.title}
              maxLength={100}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                placeholder="Describe your item in detail..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={6}
                maxLength={1000}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.description.length}/1000
                </p>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      updateFormData('category', category)
                      updateFormData('subcategory', '')
                    }}
                    className={`p-3 text-left border rounded-lg transition-all ${
                      formData.category === category
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{category}</div>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
              )}
            </div>

            {formData.category && (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <label className="block text-sm font-medium text-foreground">
                  Subcategory
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBCATEGORIES[formData.category]?.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => updateFormData('subcategory', subcategory)}
                      className={`p-2 text-sm text-left border rounded-lg transition-all ${
                        formData.subcategory === subcategory
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
                {errors.subcategory && (
                  <p className="text-sm text-red-600">{errors.subcategory}</p>
                )}
              </MotionDiv>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.price || ''}
                  onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-8 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.price ? 'border-red-500' : ''
                  }`}
                  min="0"
                  max="10000"
                  step="0.01"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price}</p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="firm"
                checked={formData.firm}
                onChange={(e) => updateFormData('firm', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
              />
              <label htmlFor="firm" className="text-sm text-gray-700">
                Price is firm (not negotiable)
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Research similar items to price competitively. 
                Berkeley students love good deals!
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Photos ({formData.images.length}/{MAX_IMAGES_PER_LISTING})
              </label>
              
              {/* Image Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <MotionDiv
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    {/* TODO: Replace with next/image for better performance */}
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </MotionDiv>
                ))}
                
                {/* Add Photo Button */}
                {formData.images.length < MAX_IMAGES_PER_LISTING && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photo</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              {errors.images && (
                <p className="text-sm text-red-600">{errors.images}</p>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  📸 <strong>Photo tips:</strong> Good photos sell faster! Include multiple angles, 
                  good lighting, and show any defects clearly.
                </p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Size Category
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateFormData('size', 'carry')}
                  className={`p-4 text-left border rounded-lg transition-all ${
                    formData.size === 'carry'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium mb-1">Easy to Carry</div>
                  <div className="text-sm text-gray-600">
                    Books, electronics, small items
                  </div>
                </button>
                <button
                  onClick={() => updateFormData('size', 'large')}
                  className={`p-4 text-left border rounded-lg transition-all ${
                    formData.size === 'large'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium mb-1">Large Item</div>
                  <div className="text-sm text-gray-600">
                    Furniture, appliances, bulky items
                  </div>
                </button>
              </div>
              {errors.size && (
                <p className="text-sm text-red-600 mt-1">{errors.size}</p>
              )}
            </div>

            <Input
              label="Weight (optional)"
              placeholder="e.g., 2 lbs, 10 kg"
              value={formData.weight}
              onChange={(e) => updateFormData('weight', e.target.value)}
              helperText="Help buyers understand shipping/pickup logistics"
            />
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Review Your Listing</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-primary">{formData.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{formData.description}</p>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="font-medium">{formData.category} → {formData.subcategory}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="font-bold text-primary text-lg">
                    ${formData.price.toFixed(2)} {formData.firm && <span className="text-xs bg-secondary text-white px-2 py-1 rounded ml-2">FIRM</span>}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Photos</span>
                  <span className="font-medium">{formData.images.length} image{formData.images.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Size</span>
                  <span className="font-medium capitalize">{formData.size === 'carry' ? 'Easy to Carry' : 'Large Item'}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                🎉 Ready to publish! Your listing will be visible to all Berkeley students immediately.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Create New Listing</h1>
        <div className="flex items-center space-x-4">
          {STEPS.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                index <= currentStep ? 'bg-white text-primary' : 'bg-white/20 text-white/70'
              }`}>
                {index < currentStep ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 transition-all ${
                  index < currentStep ? 'bg-white' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-medium">{STEPS[currentStep].title}</h2>
          <p className="text-white/80 text-sm">{STEPS[currentStep].description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait" custom={currentStep}>
            <MotionDiv
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              {renderStep()}
            </MotionDiv>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="flex items-center">
              Next
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmation(true)}
              className="bg-secondary hover:bg-secondary/90 flex items-center"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Publish Listing
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Are you sure?
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  You will not be able to edit your listing after it goes public. 
                  Make sure all information is correct before publishing.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false)
                    onStepChange(2) // Go back to pricing step as specified in user vision
                  }}
                  className="flex-1"
                >
                  Keep Editing
                </Button>
                <Button
                  onClick={() => {
                    setShowConfirmation(false)
                    handleSubmit()
                  }}
                  loading={isSubmitting}
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}