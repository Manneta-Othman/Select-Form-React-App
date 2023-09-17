import { useEffect, useRef, useState } from 'react'
import styles from './select.module.css'


export type selectOption = {
    label: string
    value: string | number
}

type multipleSelectProps = {
  multiple: true
  value: selectOption[]
  onChange: (value: selectOption[]) => void

}

type singleSelectProps = {
  multiple?: false
  value?: selectOption 
  onChange: (value: selectOption | undefined) => void
}

type selectProps = {
    options: selectOption[]
} & (singleSelectProps | multipleSelectProps)

export function Select({multiple, value, onChange, options}: selectProps) {

  
  const [isOpen, setIsOpen] = useState(false);
  
  const[highlightedIndex, setHighlightedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null)

  function clearOptions() {
      multiple ? onChange([]) : onChange(undefined)
    }

    function selectOption(option:selectOption) {
      if(multiple){
        if(value.includes(option)){
          onChange(value.filter(o => o !== option))
        }else{
          onChange([...value, option])
        }
      }else{
        if(option !== value) onChange(option)
      }
    }

    function isOptionSelected(option:selectOption) {
      return multiple ? value.includes(option) : option === value
    }

    useEffect(() => {
      if(isOpen) setHighlightedIndex(0)
    }, [isOpen])

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if(e.target != containerRef.current) return
        switch(e.code){
          case 'Enter':
          case 'Space':
            setIsOpen(prev => !prev)
            if(isOpen) selectOption(options[highlightedIndex]);
            break;
          case 'ArrowUp':
          case 'ArrowDown':{
            if(!isOpen){
              setIsOpen(true)
              break;
            }
            const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1)
            if(newValue >= 0 && newValue < options.length){
              setHighlightedIndex(newValue)
            }
            break;
          }
          
          case 'Escape':
            setIsOpen(false)
            break;
          }
      }

      containerRef.current?.addEventListener('keydown', handler)

      return () => {
        containerRef.current?.removeEventListener('keydown', handler)
      }
    }, [isOpen, highlightedIndex, options])


    return (
        <>
        <div 
          ref={containerRef}
          onBlur={() => setIsOpen(false)}
          onClick={() => setIsOpen(prev => !prev)} 
          tabIndex={0} 
          className={styles.container}
        >
          <span className={styles.value}>{multiple ? value.map(v => (
            <button key={v.value} onClick={(e) => {
              e.stopPropagation();
              selectOption(v);
            }} 
            className={styles["option-badge"]}
            >
              {v.label}
              <span className={styles["clear-btn"]}>&times;</span>
            </button>
          )) : value?.label}</span>
          <button 
            className={styles["clear-btn"]}
            onClick={e => {
              clearOptions()
              e.stopPropagation()
            }}
            >&times;</button>
          <div className={styles.divider}></div>
          <div className={styles.caret}></div>
          <ul className={`${styles.options} ${isOpen ? styles.show : ''}`}>
              {options.map((option, index) => (
                  <li 
                    key={option.value} 
                    className={` ${styles.option} ${isOptionSelected(option) ? styles.selected : '' } ${highlightedIndex === index ? styles.highlighted : '' }`}
                    onClick={e => {
                      e.stopPropagation()
                      selectOption(option)
                      setIsOpen(false)
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    >
                    {option.label}
                  </li>
              ))}
          </ul>
        </div>
        </>
    )

}