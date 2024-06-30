'use client'

import Image from "next/image";
import { testData, similarImages } from "@/data/test-data";
import { useEffect, useState, useRef } from "react";
import { useAnimate, stagger, motion, animate, useAnimationControls, AnimatePresence, delay } from "framer-motion";

interface Item {
  _id: string;
  description: string;
  email: string;
  s3_url: string;
  vsearch_results: [];
  start_dwnld: Date;
  end_dwnld: Date;
  start_s3_store: Date;
  end_s3_store: Date;
  start_astra_store: Date;
  end_astra_store: Date;
  start_get_desc: Date;
  end_get_desc: Date;
  start_embedding: Date;
  end_embedding: Date;
  start_vsearch: Date;
  end_vsearch: Date;
}

interface Image {
  _id: string;
  brand: string;
  file_path: string;
  product_name: string;
  similarity: number;
  vsearch_results: any[]; // Add the vsearch_results property
}

export default function Home() {

  const controls = useAnimationControls();
  const [scope, animate] = useAnimate();

  const [items, setItems] = useState<Item[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const numItems = useRef<number>(0);
  const animationDuration = useRef<number>(10000);
  
  const duration_dwnld = useRef<number | undefined>(0);
  const duration_s3_store = useRef<number | undefined>(0);
  const duration_astra_store = useRef<number | undefined>(0);
  const duration_get_desc = useRef<number | undefined>(0);
  const duration_embedding = useRef<number | undefined>(0);
  const duration_vsearch = useRef<number | undefined>(0);

  const getImages = async () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    try {
      const response = await fetch("api/images", {
        cache: "no-store",
      });
      const data = await response.json();
      setItems(data.data);
      return data;
    } catch (error) {
      setError('Failed to fetch images');
      setLoading(false);
    }
  };

  const fetchData = () => {
    getImages().then((data) => {
      setImages(data.data[currentItem].vsearch_results);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
    if (!loading) handleDurationCalculation();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    numItems.current = items.length;
    if (!loading) handleDurationCalculation();
  }, [items]);

  useEffect(() => {
    setImages(items[currentItem]?.vsearch_results || []); 
    if (!loading) handleDurationCalculation();
  }, [currentItem]);

  const calculateDuration = (start: Date, end: Date) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = endTime - startTime;
    return !isNaN(duration) ? duration : 0;
  };

  const handleDurationCalculation = () => {

    if(!items[currentItem]) return;

    console.log("it works");
    setCurrentItem(currentItem);
    if (!timerStarted) {
      startTimer();
      setTimerStarted(true);
    }

    duration_dwnld.current = calculateDuration(items[currentItem]?.start_dwnld, items[currentItem]?.end_dwnld);
    duration_s3_store.current = calculateDuration(items[currentItem]?.start_s3_store, items[currentItem]?.end_s3_store);
    duration_astra_store.current = calculateDuration(items[currentItem]?.start_astra_store, items[currentItem]?.end_astra_store);
    duration_get_desc.current = calculateDuration(items[currentItem]?.start_get_desc, items[currentItem]?.end_get_desc);
    duration_embedding.current = calculateDuration(items[currentItem]?.start_embedding, items[currentItem]?.end_embedding);
    duration_vsearch.current = calculateDuration(items[currentItem]?.start_vsearch, items[currentItem]?.end_vsearch);

  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setCurrentItem((prevItemNum) => {
          const newItemNum = prevItemNum + 1;
          if (newItemNum >= numItems.current) {
            //window.location.reload();
            return 0; // Reset the counter
          }
          return newItemNum;
        });
      }, animationDuration.current);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentItem(0);
    fetchData();
  };

  const processAnimationCard = {
    initial: { 
      opacity: 0, 
      x: -100
    },
    animate: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        easeInOut: 0.5,
        delay: 0.5 * index
      }
    })
  }

  const processAnimationArrow = {
    initial: { 
      opacity: 0, 
      x: -100
    },
    animate: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        easeInOut: 0.5,
        delay: 0.55 * index
      }
    })
  }

  const slideIndicatorSequence = async () => {
    if(scope.current === null) return;
    await animate(
      "#slide-indicator1",
      {
        width: "100%"
      },
      {
        duration: animationDuration.current / 1000
      }
    );
    await animate(
      "#slide-indicator2",
      {
        width: "100%"
      },
      {
        duration: animationDuration.current / 1000
      }
    );
    await slideIndicatorSequence();
  }

  const slideIndicator = {
    initial: { 
      x: "-100%"
    },
    animate: {
      x: ["-100%", "0%", "100%"],
      transition: {
        duration: (animationDuration.current / 1000)*2,
        repeat: Infinity,
      }
    },
    exit: {
      x: "100%",
      transition: {
        duration: animationDuration.current / 1000
      }
    }
  }
  const slideIndicator2 = {
    initial: { 
      x: "-100%" 
    },
    animate: {
      x: ["-100%", "0%", "100%"],
      transition: {
        duration: (animationDuration.current / 1000)*2,
        delay: animationDuration.current / 1000,
        repeat: Infinity,
      }
    },
    exit: {
      x: "100%",
      transition: {
        duration: animationDuration.current / 1000
      }
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto p-10 min-h-screen flex items-center justify-center">
        <div>Fetching latest items...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-10 min-h-screen flex items-center justify-center">
        <div>{error}</div>
      </main>
    );
  }

  return (
    <main className="w-full h-screen overflow-hidden">
      <div ref={scope}>
        <AnimatePresence>
          <motion.div
            key={0}
            id="slide-indicator1" 
            variants={slideIndicator}
            animate="animate"
            initial="initial"
            exit = "exit"
            className="w-full fixed bottom-0 h-2 bg-[#7AA116]"
          >
          </motion.div>
          <motion.div
            key={1}
            id="slide-indicator2"
            variants={slideIndicator2}
            animate="animate"
            initial="initial"
            exit = "exit"
            className="w-full fixed bottom-0 h-2 bg-[#ED7101]"
          >
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        <motion.section 
          key={currentItem} 
          className="container h-screen mx-auto flex flex-col gap-10 py-10 overflow-hidden"
          initial={{ y: "-100%", opacity: 0}}
          animate={{ y: 0, opacity: 1}}
          exit={{ y: "100%", opacity: 0}}
          transition={{ duration: 0.5, ease: "easeInOut", type: "tween"}}
        >
          <div className="items-start justify-center flex gap-10 overflow-hidden">
            <motion.div
              className="w-1/4 aspect-square flex-shrink-0"
              variants={processAnimationCard}
              initial="initial"
              whileInView="animate"
              custom={0}
            >
              <Image src={items[currentItem].s3_url} alt={items[currentItem].description} width={300} height={300} className="bg-white relative object-cover h-full w-full rotate-90" />
            </motion.div>
            <div>
              <motion.p 
                className="description"
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={2}
              >
                {items[currentItem].description}
              </motion.p>
              <motion.div
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={5}
              >
                <h2 className="font-bold text-xl mt-5">Similar Images:</h2>
                <div className="py-5 items-center justify-start">
                  <ul className="flex flex-row gap-5 justify-start">
                    {images.map((image) => (
                      <li key={image._id}>
                        <Image src={image.file_path} alt={image.brand} width={100} height={100} className="bg-white object-cover" />
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="flex flex-row gap-5 justify-center">
            <ul className="steps">
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={0}
              >
                <div className="title"><span className="step-counter"></span>Process Image</div>
                <div className="icons">
                  <Image src="Arch_Amazon-EC2_64.svg" alt="EC2" width={50} height={50} />
                  <Image src="Arch-Category_Storage_64.svg" alt="S3" width={50} height={50} />
                </div>
                <p>EC2 to read image from Email, S3 to store image, Privatelink to connect to S3</p>
                <div className="duration"><span>Duration:</span>{duration_s3_store.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={0}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={1}
              >
                <div className="title"><span className="step-counter"></span>Store in Astra</div>
                <div className="icons">
                  <Image src="astra_logo.jpg" alt="Astra" width={120} height={50} />
                </div>
                <p>Images are stored in Astra</p>
                <div className="duration"><span>Duration:</span>{duration_astra_store.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={1}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={2}
              >
                <div className="title"><span className="step-counter"></span>Generate Description</div>
                <div className="icons">
                  <Image src="Arch_Amazon-Bedrock_64.svg" alt="Bedrock" width={50} height={50} />
                  <Image src="claude3.jpg" alt="Claude 3 Sonnet" width={120} height={30} />
                </div>
                <p>Image description generated by Claude 3 Sonnet</p>
                <div className="duration"><span>Duration:</span>{duration_get_desc.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={2}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={3}
              >
                <div className="title"><span className="step-counter"></span>Generate Embedding</div>
                <div className="icons">
                  <Image src="Arch_Amazon-Bedrock_64.svg" alt="Bedrock" width={50} height={50} />
                </div>
                <p>Use Bedrock to generate embedding from image and description</p>
                <div className="duration"><span>Duration:</span>{duration_embedding.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={3}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={4}
              >
                <div className="title"><span className="step-counter"></span>Vector Search</div>
                <div className="icons">
                  <Image src="astra_logo.jpg" alt="Astra" width={120} height={50} />
                </div>
                <p>Search for similar images in Astra</p>
                <div className="duration"><span>Duration:</span>{duration_vsearch.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={4}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={5}
              >
                <div className="title"><span className="step-counter"></span>Display Results</div>
                <div className="icons">
                  <Image src="Nextjs-logo.svg" alt="NextJS" width={150} height={50} />
                </div>
                <p>Results are displayed on the dashboard</p>
                <div className="duration"><span>Duration:</span>{duration_dwnld.current} ms</div>
              </motion.li>
            </ul>
          </div>
        </motion.section>
      </AnimatePresence>
    </main>
  );
}
