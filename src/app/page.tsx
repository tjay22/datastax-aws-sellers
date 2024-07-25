'use client'

import Image from "next/image";
import { useEffect, useState, useRef, useMemo } from "react";
import { useAnimate, stagger, motion, animate, useAnimationControls, AnimatePresence, delay } from "framer-motion";
import usePersistState from "./usePersistState";
import { GlobalConfig } from "./app.config";

import StepCard from "./components/StepCard";
import { Item, SimilarImage } from "./types";

export default function Home() {

  const controls = useAnimationControls();
  const showTextControls = useAnimationControls();
  const [scope, animate] = useAnimate();

  const [items, setItems] = useState<Item[]>([]);
  const [images, setImages] = useState<SimilarImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [slideshowAnimation, setSlideshowAnimation] = useState<string>("in");
  
  const [isRunningSlideshow, setIsRunningSlideshow] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slideshowInterval = useRef<number>(GlobalConfig.slideshowInterval);
  const slideshowTransitionDuration = useRef<number>(GlobalConfig.slideshowTransitionDuration);
  let slideshowTransitionDelay = slideshowInterval.current - slideshowTransitionDuration.current;
  const numItems = useRef<number>(0);
  const prevItems = useRef<Item[]>([]);

  const [isRunningFetchData, setIsRunningFetchData] = useState<boolean>(false);
  const timerRefFetchData = useRef<NodeJS.Timeout | null>(null);
  const fetchInterval = useRef<number>(GlobalConfig.slideshowInterval);

  // API Fetch handler
  const getData = async () => {
    try {
      const response = await fetch("api/images", {
        cache: "no-store",
      });
      const data = await response.json();
      return data;
    } catch (error) {
      setError(GlobalConfig.messages.imagesLoadError);
      setLoading(false);
    }
  };

  // Function that fetches data from the API and updates the items state which triggers the useEffect
  const fetchData = () => {
    getData().then((data) => {
      const datafromApi = data.data;
      const reversedData = [...datafromApi].reverse();
      if(GlobalConfig.reverseData) {
        updateItemsState(reversedData);
      } else {
        updateItemsState(datafromApi);
      }
      setLoading(false);
    });
  };

  const partialEmail = (email: string) => {
    return email.replace(/(.{2})(.*)(?=@)/, (a, b, c) => b + c.replace(/./g, "*"));
  }

  // Function to compare the previous and new data
  const dataIsEqual = (arr1: Item[], arr2: Item[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i]._id !== arr2[i]._id) return false;
    }
    return true;
  };

  // Function to check if the data has changed. If it has, update the items state and start slideshow from item[0]
  const updateItemsState = (newItems: Item[]) => {
    if (!dataIsEqual(prevItems.current, newItems)) {
      setItems(newItems);
      setCurrentItem(0);
      prevItems.current = newItems;
      showTextControls.start("animate");
    }
  };

  // Step 1: Fetch Data from API and clear any active timers
  useEffect(() => {
    fetchData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (timerRefFetchData.current) {
        clearInterval(timerRefFetchData.current);
      }
    };
  }, []);

  // useEffect triggered by items state change (from fetchData())
  useEffect(() => {
    numItems.current = items.length;
    setImages(items[currentItem]?.vsearch_results || []);
    handleTimers();
  }, [items]);

  useEffect(() => {
    console.log("Current Item: ", currentItem);
  }, [currentItem]);

  const handleTimers = () => {

    if(!items[currentItem]) return;

    if (!timerStarted) {
      startDataFetchTimer();
      startSlideshowTimer();
      setTimerStarted(true);
    }

  };

  // Data Fetch Timer
  const startDataFetchTimer = () => {
    if (!isRunningFetchData) {
      setIsRunningFetchData(true);
      timerRefFetchData.current = setInterval(() => {
        fetchData();
      }, fetchInterval.current);
    }
  };

  // Slideshow Timer
  const startSlideshowTimer = () => {
    if (!isRunningSlideshow) {
      controls.set("initial");
      controls.start("animate");
      setIsRunningSlideshow(true);
      setTimerStarted(true);
      timerRef.current = setInterval(() => {
        setSlideshowAnimation("in");
        setTimeout(() => {
          setSlideshowAnimation("out");
        }, slideshowTransitionDelay);
        setCurrentItem((prevItemNum) => {
          const newItemNum = prevItemNum + 1;
          if (newItemNum >= numItems.current) {
            return 0; // Reset the counter
          }
          return newItemNum;
        });
      }, slideshowInterval.current);
    }
  };

  const resetSlideshowTimer = () => {
    setTimerStarted(false);
    setIsRunningSlideshow(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      startSlideshowTimer();
      setCurrentItem(0);
    }
  };

  const resetDataFetchTimer = () => {
    setIsRunningFetchData(false);
    if (timerRefFetchData.current) {
      clearInterval(timerRefFetchData.current);
      startDataFetchTimer();
    }
  };

  /* Animation definitions start here */

  const processAnimationCard = {
    initial: { 
      opacity: 0, 
      x: -100
    },
    animate: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: GlobalConfig.cardAnimationDuration/1000,
        easeInOut: GlobalConfig.cardAnimationDuration/1000,
        delay: (GlobalConfig.cardStaggerDelay/1000) * index
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
        duration: GlobalConfig.cardAnimationDuration/1000,
        easeInOut: GlobalConfig.cardAnimationDuration/1000,
        delay: ((GlobalConfig.cardStaggerDelay/1000) + 0.05) * index
      }
    })
  }

  const sectionAnimationVariants = {
    out: {
      opacity: 0,
      transition: {
        duration: GlobalConfig.slideshowTransitionDuration/1000
      }
    },
    in: {
      opacity: 1,
      transition: {
        duration: GlobalConfig.slideshowTransitionDuration/1000
      }
    }
  }

  const slideIndicator = {
    initial: { 
      x: "-100%"
    },
    animate: {
      x: ["-100%", "0%", "100%"],
      transition: {
        duration: (slideshowInterval.current / 1000)*2,
        repeat: Infinity,
      }
    },
    exit: {
      x: "100%",
      transition: {
        duration: slideshowInterval.current / 1000
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
        duration: (slideshowInterval.current / 1000)*2,
        delay: slideshowInterval.current / 1000,
        repeat: Infinity,
      }
    },
    exit: {
      x: "100%",
      transition: {
        duration: slideshowInterval.current / 1000
      }
    }
  }
  
  const newDataTextAnimation = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: [0, 1, 1, 0],
      y: [0, -10, -10, 0],
      transition: {
        duration: 5,
        times: [0, 0.1, 0.9, 1],
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  /* Animation definitions end here */

  if (loading) {
    return (
      <main className="container mx-auto p-10 min-h-screen flex items-center justify-center">
        <div>{GlobalConfig.messages.imagesFetching}</div>
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
    <main className="w-full h-screen overflow-hidden px-5">
      <div ref={scope}>
        <AnimatePresence>
          <motion.div
            key={0}
            id="slide-indicator1" 
            variants={slideIndicator}
            animate={controls}
            initial="initial"
            exit = "exit"
            className="w-full fixed bottom-0 h-2 bg-[#7AA116]"
          >
          </motion.div>
          <motion.div
            key={1}
            id="slide-indicator2"
            variants={slideIndicator2}
            animate={controls}
            initial="initial"
            exit = "exit"
            className="w-full fixed bottom-0 h-2 bg-[#ED7101]"
          >
          </motion.div>
          <motion.div
            key={2}
            id="text-indicator"
            variants={newDataTextAnimation}
            initial="initial"
            animate={showTextControls}
            exit="exit"
            className="w-auto absolute bottom-0 bg-[#00A88D] text-white text-center py-2 px-4 rounded-sm shadow-lg my-10 mx-5 z-10"
          >
            New entry from {partialEmail(items[currentItem].email)}
          </motion.div>
        </AnimatePresence>
      </div>
        <AnimatePresence mode="sync">
          <motion.section 
            key={currentItem} 
            data-id={currentItem}
            className="container h-screen mx-auto flex flex-col gap-10 py-10 overflow-hidden"
            animate={slideshowAnimation}
            variants={sectionAnimationVariants}
          >
            <div className="items-start justify-center flex gap-10 overflow-hidden">
              <motion.div
                className="w-1/5 aspect-square flex-shrink-0 relative"
                variants={processAnimationCard}
                initial="initial"
                animate="animate"
                custom={0}
              >
                <div className="loader-container absolute flex items-center justify-center w-full h-full">
                  <div className="loader"></div>
                </div>
                <Image src={items[currentItem].s3_url} alt={items[currentItem].description} width={0} height={0} className="bg-transparent relative object-cover h-full w-full rotate-90" />
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
                  animate="animate"
                  custom={5}
                >
                  <h2 className="font-bold text-xl mt-5">Similar Images:</h2>
                  <div className="py-5 items-center justify-start">
                    <ul className="flex flex-row gap-5 justify-start">
                      {images.map((image) => (
                        <li key={image._id}>
                          <Image 
                            src={image.file_path} 
                            alt={image.brand} 
                            width={0} 
                            height={0} 
                            className="bg-white object-cover w-[100px] h-auto" 
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <div className="flex flex-row gap-5 justify-center">
              <ul className="steps">
                {GlobalConfig.steps.map((step, index) => (
                  <StepCard 
                    key={index}
                    id={index} 
                    items={items}
                    currentItem={currentItem}
                    durationStartVar={step.duration_start_var}
                    durationEndVar={step.duration_end_var}
                    processAnimationCard={processAnimationCard}
                    processAnimationArrow={processAnimationArrow}
                    title={step.title}
                    description={step.description}
                    icons={step.icons}
                  />
                ))}
              </ul>
            </div>
          </motion.section>
        </AnimatePresence>
    </main>
  );
}
