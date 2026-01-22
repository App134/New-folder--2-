import React from 'react';
import { motion } from 'framer-motion';

const animations = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

const AnimatedPage = ({ children }) => {
    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            style={{ width: '100%', height: '100%' }} // Ensure it doesn't collapse
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;
