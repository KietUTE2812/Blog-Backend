const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

// Sample categories for a personal blog
const sampleCategories = [
    {
        name: 'Technology',
        description: 'Posts about programming, software development, and tech trends'
    },
    {
        name: 'Web Development',
        description: 'Frontend and backend development tutorials, frameworks, and best practices'
    },
    {
        name: 'JavaScript',
        description: 'JavaScript tutorials, ES6+ features, and modern JS development'
    },
    {
        name: 'React',
        description: 'React.js tutorials, hooks, components, and ecosystem'
    },
    {
        name: 'Node.js',
        description: 'Backend development with Node.js, Express, and server-side JavaScript'
    },
    {
        name: 'Database',
        description: 'Database design, MongoDB, SQL, and data management topics'
    },
    {
        name: 'DevOps',
        description: 'Deployment, CI/CD, Docker, cloud services, and infrastructure'
    },
    {
        name: 'Mobile Development',
        description: 'iOS, Android, React Native, and mobile app development'
    },
    {
        name: 'UI/UX Design',
        description: 'User interface design, user experience, and design principles'
    },
    {
        name: 'Career',
        description: 'Career advice, job interviews, and professional development'
    },
    {
        name: 'Tutorials',
        description: 'Step-by-step guides and educational content'
    },
    {
        name: 'Tips & Tricks',
        description: 'Quick tips, productivity hacks, and useful shortcuts'
    },
    {
        name: 'Open Source',
        description: 'Open source projects, contributions, and community involvement'
    },
    {
        name: 'Personal',
        description: 'Personal thoughts, experiences, and life updates'
    },
    {
        name: 'Reviews',
        description: 'Product reviews, tool comparisons, and recommendations'
    }
];

const createSampleCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-blog', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Check if categories already exist
        const existingCategories = await Category.find();
        if (existingCategories.length > 0) {
            console.log(`Found ${existingCategories.length} existing categories. Skipping creation to avoid duplicates.`);
            console.log('Existing categories:');
            existingCategories.forEach(cat => {
                console.log(`- ${cat.name}: ${cat.description}`);
            });
            process.exit(0);
        }

        // Create sample categories
        console.log('Creating sample categories...');

        const genSlug = (name) => {
            return name.toLowerCase().replace(/ /g, '-');
        }
        
        let createdCount = 0;
        for (const categoryData of sampleCategories) {
            try {
                const category = new Category({ ...categoryData, slug: genSlug(categoryData.name) });
                await category.save();
                console.log(`✓ Created category: ${categoryData.name}`);
                createdCount++;
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`⚠ Category "${categoryData.name}" already exists, skipping...`);
                } else {
                    console.error(`✗ Error creating category "${categoryData.name}":`, error.message);
                }
            }
        }

        console.log(`\n🎉 Successfully created ${createdCount} sample categories!`);
        console.log('\nAll categories:');
        const allCategories = await Category.find();
        allCategories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat.name} - ${cat.description}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error creating sample categories:', error);
        process.exit(1);
    }
};

// Run the script if called directly
if (require.main === module) {
    createSampleCategories();
}

module.exports = { createSampleCategories, sampleCategories };
