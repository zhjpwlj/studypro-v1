import React, { useState, useContext } from 'react';
import { Divide, X, Minus, Plus, Percent } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';


const Calculator: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const [displayValue, setDisplayValue] = useState('0');
  const [expression, setExpression] = useState('');
  const [isScientific, setIsScientific] = useState(false);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  


  const inputDigit = (digit: string): void => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = (): void => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const clear = (): void => {
    setDisplayValue('0');
    setExpression('');
    setWaitingForOperand(false);
  };

  const performOperation = (op: string): void => {
    if (op === '=') {
        try {
            // Replace visual operators with JS operators
            let evalString = expression + displayValue;
            evalString = evalString.replace(/×/g, '*').replace(/÷/g, '/');
            
            // Safer alternative to eval for simple math
            // Only allow numbers and basic operators
            if (!/^[0-9+\-*/. ]+$/.test(evalString)) {
                throw new Error('Invalid expression');
            }

            const result = new Function(`return ${evalString}`)(); 
            setDisplayValue(String(Number(result.toFixed(8)))); // Limit precision
            setExpression('');
            setWaitingForOperand(true);
        } catch {
            setDisplayValue('Error');
            setWaitingForOperand(true);
        }
    } else {
        setExpression(displayValue + ' ' + (op === '*' ? '×' : op === '/' ? '÷' : op) + ' ');
        setWaitingForOperand(true);
    }
  };

  const performScientific = (func: string): void => {
      const val = parseFloat(displayValue);
      let res = 0;
      switch(func) {
          case 'sin': res = Math.sin(val * Math.PI / 180); break;
          case 'cos': res = Math.cos(val * Math.PI / 180); break;
          case 'tan': res = Math.tan(val * Math.PI / 180); break;
          case 'log': res = Math.log10(val); break;
          case 'ln': res = Math.log(val); break;
          case 'sqrt': res = Math.sqrt(val); break;
          case 'sq': res = Math.pow(val, 2); break;
          case 'pi': res = Math.PI; break;
          case 'e': res = Math.E; break;
          case 'inv': res = 1 / val; break;
          default: return;
      }
      setDisplayValue(String(Number(res.toFixed(8))));
      setWaitingForOperand(true);
  };

  const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({ onClick, className, children }): JSX.Element => (
    <button onClick={onClick} className={`rounded-xl flex items-center justify-center text-xl font-medium transition-all active:scale-95 shadow-sm hover:brightness-110 ${className}`}>
      {children}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-4 select-none">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex gap-2">
            <button 
                onClick={() => setIsScientific(false)} 
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${!isScientific ? 'bg-white text-slate-900 font-bold' : 'bg-slate-800 text-slate-400'}`}
            >
                {t('basic')}
            </button>
            <button 
                onClick={() => setIsScientific(true)} 
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${isScientific ? 'bg-white text-slate-900 font-bold' : 'bg-slate-800 text-slate-400'}`}
            >
                {t('scientific')}
            </button>
          </div>
      </div>
      
      <div className="flex-1 bg-black/20 rounded-2xl mb-4 p-6 flex flex-col items-end justify-end overflow-hidden shadow-inner">
        <div className="text-slate-400 text-lg h-8 mb-1">{expression}</div>
        <div className="text-6xl font-light tracking-tight break-all">{displayValue}</div>
      </div>

      <div className={`grid gap-3 flex-shrink-0 h-[60%] ${isScientific ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {isScientific && (
            <>
                <Button onClick={() => performScientific('sin')} className="bg-slate-800 text-sm">sin</Button>
                <Button onClick={() => performScientific('cos')} className="bg-slate-800 text-sm">cos</Button>
                <Button onClick={() => performScientific('tan')} className="bg-slate-800 text-sm">tan</Button>
                <Button onClick={() => performScientific('log')} className="bg-slate-800 text-sm">log</Button>
                <Button onClick={() => performScientific('ln')} className="bg-slate-800 text-sm">ln</Button>
                
                <Button onClick={() => performScientific('pi')} className="bg-slate-800 text-sm">π</Button>
                <Button onClick={() => performScientific('e')} className="bg-slate-800 text-sm">e</Button>
                <Button onClick={() => performScientific('sqrt')} className="bg-slate-800 text-sm">√</Button>
                <Button onClick={() => performScientific('sq')} className="bg-slate-800 text-sm">x²</Button>
                <Button onClick={() => performScientific('inv')} className="bg-slate-800 text-sm">1/x</Button>
            </>
        )}

        <Button onClick={clear} className="bg-slate-300 text-black font-semibold">AC</Button>
        <Button onClick={() => setDisplayValue(String(parseFloat(displayValue) * -1))} className="bg-slate-300 text-black font-semibold">+/-</Button>
        <Button onClick={() => setDisplayValue(String(parseFloat(displayValue) / 100))} className="bg-slate-300 text-black font-semibold"><Percent size={20}/></Button>
        <Button onClick={() => performOperation('/')} className="bg-orange-500 text-white"><Divide size={24}/></Button>
        
        <Button onClick={() => inputDigit('7')} className="bg-slate-700 hover:bg-slate-600">7</Button>
        <Button onClick={() => inputDigit('8')} className="bg-slate-700 hover:bg-slate-600">8</Button>
        <Button onClick={() => inputDigit('9')} className="bg-slate-700 hover:bg-slate-600">9</Button>
        <Button onClick={() => performOperation('*')} className="bg-orange-500 text-white"><X size={20}/></Button>

        <Button onClick={() => inputDigit('4')} className="bg-slate-700 hover:bg-slate-600">4</Button>
        <Button onClick={() => inputDigit('5')} className="bg-slate-700 hover:bg-slate-600">5</Button>
        <Button onClick={() => inputDigit('6')} className="bg-slate-700 hover:bg-slate-600">6</Button>
        <Button onClick={() => performOperation('-')} className="bg-orange-500 text-white"><Minus size={24}/></Button>
        
        <Button onClick={() => inputDigit('1')} className="bg-slate-700 hover:bg-slate-600">1</Button>
        <Button onClick={() => inputDigit('2')} className="bg-slate-700 hover:bg-slate-600">2</Button>
        <Button onClick={() => inputDigit('3')} className="bg-slate-700 hover:bg-slate-600">3</Button>
        <Button onClick={() => performOperation('+')} className="bg-orange-500 text-white"><Plus size={24}/></Button>
        
        <Button onClick={() => inputDigit('0')} className={`bg-slate-700 hover:bg-slate-600 ${isScientific ? '' : 'col-span-2'}`}>0</Button>
        <Button onClick={inputDecimal} className="bg-slate-700 hover:bg-slate-600">.</Button>
        <Button onClick={() => performOperation('=')} className={`bg-orange-500 text-white ${isScientific ? 'col-span-2' : ''}`}>=</Button>
      </div>
    </div>
  );
};

export default Calculator;