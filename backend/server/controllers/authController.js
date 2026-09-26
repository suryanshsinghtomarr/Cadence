import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const createToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    console.log('Registration request received:', { name, email })

    if (!name || !email || !password) {
      console.error('Registration validation failed: missing required field')
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.error('Registration rejected: email already registered', email)
      return res.status(409).json({ message: 'Email already registered' })
    }

    console.log('Hashing password for registration:', email)
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('Password hashing completed:', email)

    console.log('Saving new user to MongoDB:', email)
    const user = await User.create({
      name,
      email,
      passwordHash,
    })
    console.log('User saved successfully:', email)

    const token = createToken(user)

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Registration failed:', {
      name: error.name,
      message: error.message,
      code: error.code,
    })
    return res.status(500).json({
      message:
        process.env.NODE_ENV === 'production'
          ? 'Server error during registration'
          : error.message || 'Server error during registration',
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = createToken(user)

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login' })
  }
}
