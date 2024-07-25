import { Config } from './types';

export const GlobalConfig: Config = {
  title: 'DataStax AWS Sellers',
  description: 'DataStax AWS Sellers',
  apiURL: 'http://52.12.156.81:8980/images',
  reverseData: false, //reverse the order of the data
  slideshowInterval: 6000, //interval between each slide
  slideshowTransitionDuration: 800, //fade out duration at the end of each slide
  cardAnimationDuration: 800, //duration of the card animation
  cardStaggerDelay: 500, //delay between each card animation

  messages: {
    imagesFetching: 'Fetching latest items...',
    imagesLoadError: 'Failed to fetch images'
  },

  icons: {
    astra: {
      src: 'astra_logo.jpg',
      alt: 'Astra',
    },
    bedrock: {
      src: 'Arch_Amazon-Bedrock_64.svg',
      alt: 'Bedrock',
    },
    claude3: {
      src: 'claude3.jpg',
      alt: 'Claude 3 Sonnet',
    },
    ec2: {
      src: 'Arch_Amazon-EC2_64.svg',
      alt: 'EC2'
    },
    nextjs: {
      src: "Nextjs-logo.svg",
      alt: "NextJS"
    },
    s3: {
      src: 'Arch-Category_Storage_64.svg',
      alt: 'S3'
    },
  },
  
  steps: [
    {
      id: 1,
      title: 'Process Image',
      description: 'EC2 to read image from Email, S3 to store image, Privatelink to connect to S3',
      icons: [
        {
          icon: 'ec2',
          width: 50,
          style: 'width: "50px", height: "auto"'
        },
        {
          icon: 's3',
          width: 50,
          style: 'width: "50px", height: "auto"'
        }
      ],
      duration_start_var: 'start_s3_store',
      duration_end_var: 'end_s3_store'
    },
    {
      id: 2,
      title: 'Store in Astra',
      description: 'Images are stored in Astra',
      icons: [
        {
          icon: 'astra',
          width: 120,
          style: 'width: "120px", height: "auto"'
        }
      ],
      duration_start_var: 'start_astra_store',
      duration_end_var: 'end_astra_store'
    },
    {
      id: 3,
      title: 'Generate Description',
      description: 'Image description generated by Claude 3 Sonnet',
      icons: [
        {
          icon: 'bedrock',
          width: 50,
          style: 'width: "50px", height: "auto"'
        },
        {
          icon: 'claude3',
          width: 120,
          style: 'width: "120px", height: "auto"'
        }
      ],
      duration_start_var: 'start_get_desc',
      duration_end_var: 'end_get_desc'
    },
    {
      id: 4,
      title: 'Generate Embedding',
      description: 'Bedrock to generate embedding from image and description',
      icons: [
        {
          icon: 'bedrock',
          width: 50,
          style: 'width: "50px", height: "auto"'
        }
      ],
      duration_start_var: 'start_embedding',
      duration_end_var: 'end_embedding'
    },
    {
      id: 5,
      title: 'Vector Search',
      description: 'Search for similar images in Astra',
      icons: [
        {
          icon: 'astra',
          width: 120,
          style: 'width: "120px", height: "auto"'
        }
      ],
      duration_start_var: 'start_vsearch',
      duration_end_var: 'end_vsearch'
    },
    {
      id: 6,
      title: 'Display Results',
      description: 'Results are displayed on the dashboard',
      icons: [
        {
          icon: 'nextjs',
          width: 150,
          style: 'width: "150px", height: "auto", fill: "white"'
        }
      ],
      duration_start_var: 'start_dwnld',
      duration_end_var: 'end_dwnld'
    }
  ]
}