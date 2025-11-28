import crypto from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export interface UploadedFile {
    fileName: string
    storageUrl: string
    mimeType: string
    sizeBytes: number
    sha256: string
}

/**
 * Upload a file to local storage (public/uploads directory)
 * In production, replace this with Cloudinary or S3
 */
export async function uploadFile(file: File): Promise<UploadedFile> {
    try {
        // Convert File to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Calculate SHA256 hash
        const hash = crypto.createHash('sha256')
        hash.update(buffer)
        const sha256 = hash.digest('hex')

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = crypto.randomBytes(8).toString('hex')
        const ext = path.extname(file.name)
        const fileName = `${timestamp}-${randomString}${ext}`

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'srs-reports')
        await mkdir(uploadsDir, { recursive: true })

        // Save file
        const filePath = path.join(uploadsDir, fileName)
        await writeFile(filePath, buffer)

        // Return file info
        return {
            fileName: file.name,
            storageUrl: `/uploads/srs-reports/${fileName}`,
            mimeType: file.type,
            sizeBytes: file.size,
            sha256: sha256
        }
    } catch (error) {
        console.error('File upload error:', error)
        throw new Error('Failed to upload file')
    }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, options: {
    maxSizeBytes?: number
    allowedTypes?: string[]
} = {}): { valid: boolean; error?: string } {
    const {
        maxSizeBytes = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ['application/pdf']
    } = options

    // Check file size
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size must be less than ${maxSizeBytes / (1024 * 1024)}MB`
        }
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Only ${allowedTypes.join(', ')} files are allowed`
        }
    }

    return { valid: true }
}

