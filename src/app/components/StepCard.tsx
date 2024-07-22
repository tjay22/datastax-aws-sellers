import { useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { GlobalConfig } from '../app.config'
import { StepCardType } from '../types'

const StepCard = ({ 
  id,
  items, 
  currentItem, 
  durationStartVar, 
  durationEndVar, 
  processAnimationCard, 
  processAnimationArrow, 
  title, 
  description,
  icons }: StepCardType) => {

  const duration = useRef<number | undefined>(0);

  const calculateDuration = (start: Date, end: Date) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = endTime - startTime;
    return !isNaN(duration) ? duration : 0;
  };

  duration.current = calculateDuration(items[currentItem][durationStartVar], items[currentItem][durationEndVar]);

  return (
    <motion.li 
      className="step" 
      variants={processAnimationCard}
      initial="initial"
      whileInView="animate"
      custom={id}
    >
      <div className="title"><span className="step-counter"></span>{title}</div>
      <div className="icons">
        {icons.map((icon, index) => (
          <Image 
            key={index} 
            src={GlobalConfig.icons[icon.icon].src} 
            alt={GlobalConfig.icons[icon.icon].alt} 
            width={icon.width} 
            height={icon.width} 
          />
        ))}
      </div>
      <p>{description}</p>
      <div className="duration"><span>Duration:</span>{duration.current} ms</div>
      <motion.div 
        className="arrow"
        variants={processAnimationArrow}
        initial="initial"
        animate="animate"
        custom={id}
      ></motion.div>
    </motion.li>
  )
}

export default StepCard