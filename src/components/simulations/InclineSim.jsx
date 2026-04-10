import { useEffect, useRef, useState } from 'react';

const InclineSim = ({ hideResults = false }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [angle, setAngle] = useState(30);
    const [mass, setMass] = useState(10);
    const [friction, setFriction] = useState(0.2);
    const [stats, setStats] = useState({ t: 0, v: 0, s: 0, a: 0 });
    const [isRunning, setIsRunning] = useState(false);

    const simState = useRef({
        time: 0,
        animationId: null,
        angleRad: 0,
        g: 9.8,
        m: 0,
        mu: 0,
        acceleration: 0,
        startX: 50,
        startY: 50,
        scale: 5, // pixels per meter
        dt: 0.02
    });

    const drawFrame = (ctx, canvas, distance) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { angleRad, scale } = simState.current;
        const groundY = canvas.height - 50;

        // Let's define the incline plane
        // Triangle from left to right down
        const wedgeLength = 80 * scale; // 80 meters logic
        const wedgeHeight = wedgeLength * Math.tan(angleRad);

        const startX = canvas.width / 2 - wedgeLength / 2;

        // Draw Wedge
        ctx.beginPath();
        ctx.fillStyle = document.body.classList.contains('light-mode') ? '#e5e7eb' : '#374151';
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.moveTo(startX, groundY); // bottom left
        ctx.lineTo(startX + wedgeLength, groundY); // bottom right
        ctx.lineTo(startX, groundY - wedgeHeight); // top left
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw Block
        // Position based on distance traveled down the hypotenuse
        const blockW = 8 * scale;
        const blockH = 4 * scale;

        // Starting at top point (startX, groundY - wedgeHeight)
        const currentHypotenuseDist = Math.min(distance, wedgeLength / Math.cos(angleRad));

        const bx = startX + currentHypotenuseDist * Math.cos(angleRad);
        const by = (groundY - wedgeHeight) + currentHypotenuseDist * Math.sin(angleRad);

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(angleRad);

        // Block is drawn sitting on top of the incline line
        ctx.beginPath();
        ctx.fillStyle = '#ef4444';
        ctx.rect(0, -blockH, blockW, blockH);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const { acceleration, dt } = simState.current;
        let { time } = simState.current;

        // s = (a * t^2) / 2
        // v = a * t
        const s = 0.5 * acceleration * time * time;
        const v = acceleration * time;

        const maxDist = (80 * simState.current.scale) / Math.cos(simState.current.angleRad) / simState.current.scale;

        setStats({ t: time, v, s, a: acceleration });

        if (s >= maxDist) {
            setIsRunning(false);
            drawFrame(ctx, canvas, maxDist);
            return;
        }

        drawFrame(ctx, canvas, s);
        simState.current.time += dt;
        simState.current.animationId = requestAnimationFrame(animate);
    };

    const launch = () => {
        if (isRunning) cancelAnimationFrame(simState.current.animationId);

        const aRad = parseFloat(angle) * (Math.PI / 180);
        const m = parseFloat(mass);
        const mu = parseFloat(friction);
        const g = simState.current.g;

        // Acceleration a = g * (sin(theta) - mu * cos(theta))
        let a = g * (Math.sin(aRad) - mu * Math.cos(aRad));
        if (a < 0) a = 0; // Friction holds it

        simState.current.time = 0;
        simState.current.angleRad = aRad;
        simState.current.m = m;
        simState.current.mu = mu;
        simState.current.acceleration = a;

        setIsRunning(true);
        animate();
    };

    const resetSim = () => {
        setIsRunning(false);
        cancelAnimationFrame(simState.current.animationId);
        setStats({ t: 0, v: 0, s: 0, a: 0 });
        const canvas = canvasRef.current;
        if (canvas) {
            simState.current.angleRad = parseFloat(angle) * (Math.PI / 180);
            drawFrame(canvas.getContext('2d'), canvas, 0);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                if (!isRunning) resetSim();
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        const currentSimState = simState.current;
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(currentSimState.animationId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (!isRunning) {
            resetSim();
        }
        // eslint-disable-next-line
    }, [angle, mass, friction]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Угол наклона (°): {angle}</label>
                        <input type="range" min="10" max="80" value={angle} onChange={e => setAngle(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Масса (кг): {mass}</label>
                        <input type="range" min="1" max="100" value={mass} onChange={e => setMass(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Коэфф. трения (μ): {friction}</label>
                        <input type="range" min="0" max="1" step="0.05" value={friction} onChange={e => setFriction(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={launch} style={{ minWidth: '120px' }}>
                        {isRunning ? 'Движение...' : 'ЗАПУСК'}
                    </button>
                    <button className="btn-secondary" onClick={resetSim}>
                        СБРОС
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '400px', flexWrap: 'wrap' }}>
                <div className="glass" ref={containerRef} style={{ flex: '3 1 400px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
                </div>

                <div className="glass" style={{ flex: '1 1 250px', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Телеметрия</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ускорение (a):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.a.toFixed(2)} м/с²`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Время (t):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.t.toFixed(2)} с`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Скорость (v):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.v.toFixed(1)} м/с`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Пройденный путь:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.s.toFixed(1)} м`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InclineSim;
