/**
 * Statistics Box component for displaying redirect statistics.
 * @module components/Controlpanels/StatisticsBox
 */

import React, { useState, useEffect, useRef } from 'react';
import { Statistic } from 'semantic-ui-react';

const StatisticsBox = ({ label, value, color, icon, loading, reset }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef(null);
  const currentValueRef = useRef(0);
  const prevResetRef = useRef(reset);

  useEffect(() => {
    // Clear any existing animation first
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    // Check if reset prop changed (new search initiated)
    if (reset !== prevResetRef.current) {
      prevResetRef.current = reset;
      currentValueRef.current = 0;
      setDisplayValue(0);
    }

    // Start counting immediately when component mounts or when loading or when value is null
    if (value === undefined || value === null || loading) {
      // Infinite counting animation until real value arrives
      // Optimized for ~2 second load time: increment ~500-1500 every 100ms
      const increment = () => {
        currentValueRef.current += Math.floor(Math.random() * 1000) + 500;
        setDisplayValue(currentValueRef.current);
        animationRef.current = setTimeout(increment, 100);
      };
      increment();

      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    } else {
      // When we have the real value, stop counting and animate to it
      const targetValue = value || 0;
      const startValue = currentValueRef.current;
      const duration = 800; // ms
      const steps = 30;
      const stepDuration = duration / steps;
      const increment = (targetValue - startValue) / steps;

      let currentStep = 0;
      const animate = () => {
        currentStep++;
        if (currentStep <= steps) {
          const newValue = Math.floor(startValue + increment * currentStep);
          currentValueRef.current = newValue;
          setDisplayValue(newValue);
          animationRef.current = setTimeout(animate, stepDuration);
        } else {
          currentValueRef.current = targetValue;
          setDisplayValue(targetValue);
        }
      };
      animate();

      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    }
  }, [value, loading, reset]);

  return (
    <Statistic color={color}>
      {icon && <Statistic.Label>{icon}</Statistic.Label>}
      <Statistic.Value>{displayValue.toLocaleString()}</Statistic.Value>
      <Statistic.Label>{label}</Statistic.Label>
    </Statistic>
  );
};

export default StatisticsBox;
