import React, { useEffect, useRef, useState } from 'react';

const TorqueSim = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [m1, setM1] = useState(10);
    const [d1, setD1] = useState(5);
    const [m2, setM2] = useState(10);
    const [d2, setD2] = useState(5);

    const [stats, setStats] = useState({ t1: 0, t2: 0, netT: 0, angle: 0 });

    const drawFrame = (canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2 + 50;

        const scale = 20; // pixels per meter
        const boardLength = 12 * scale; // 12 meters total board length

        const t1 = m1 * 9.8 * d1; // Torque 1 counter-clockwise
        const t2 = m2 * 9.8 * d2; // Torque 2 clockwise

        const netT = t2 - t1;

        // Calculate tilt
        // Simplification for visualization: proportional to net torque, max 30 degrees tilt
        let tilt = (netT / 1000) * (Math.PI / 4);
        if (tilt > Math.PI / 6) tilt = Math.PI / 6;
        if (tilt < -Math.PI / 6) tilt = -Math.PI / 6;

        setStats({ t1, t2, netT, angle: (tilt * 180 / Math.PI) });

        // Draw fulcrum (anchor)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 20, cy + 40);
        ctx.lineTo(cx + 20, cy + 40);
        ctx.closePath();
        ctx.fillStyle = '#6b7280';
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);

        // Draw board
        ctx.beginPath();
        ctx.rect(-boardLength / 2, -5, boardLength, 10);
        ctx.fillStyle = '#fcd34d';
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.stroke();

        // Draw masses
        // M1 on the left (-d1)
        const block1W = 10 + m1 * 0.5;
        const block1H = 10 + m1 * 0.5;
        ctx.beginPath();
        ctx.rect(- (d1 * scale) - block1W / 2, -5 - block1H, block1W, block1H);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();

        // M2 on the right (+d2)
        const block2W = 10 + m2 * 0.5;
        const block2H = 10 + m2 * 0.5;
        ctx.beginPath();
        ctx.rect((d2 * scale) - block2W / 2, -5 - block2H, block2W, block2H);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        ctx.restore();
    };

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                drawFrame(canvas);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) drawFrame(canvas);
        // eslint-disable-next-line
    }, [m1, d1, m2, d2]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                    <h4 style={{ margin: '(0 0 10px 0)', color: '#3b82f6' }}>Левый груз</h4>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Масса 1 (кг): {m1}</label>
                    <input type="range" min="1" max="50" value={m1} onChange={e => setM1(e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>Плечо 1 (м): {d1}</label>
                    <input type="range" min="1" max="6" step="0.5" value={d1} onChange={e => setD1(e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
                </div>

                <div style={{ flex: 1, minWidth: '200px', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                    <h4 style={{ margin: '(0 0 10px 0)', color: '#ef4444' }}>Правый груз</h4>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Масса 2 (кг): {m2}</label>
                    <input type="range" min="1" max="50" value={m2} onChange={e => setM2(e.target.value)} style={{ width: '100%', accentColor: '#ef4444' }} />
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>Плечо 2 (м): {d2}</label>
                    <input type="range" min="1" max="6" step="0.5" value={d2} onChange={e => setD2(e.target.value)} style={{ width: '100%', accentColor: '#ef4444' }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '400px', flexWrap: 'wrap' }}>
                <div className="glass" ref={containerRef} style={{ flex: '3 1 400px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
                </div>

                <div className="glass" style={{ flex: '1 1 250px', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Телеметрия</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Момент левый (M1):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#3b82f6' }}>{stats.t1.toFixed(1)} Н·м</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Момент правый (M2):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#ef4444' }}>{stats.t2.toFixed(1)} Н·м</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Результ. момент:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.netT.toFixed(1)} Н·м</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
                        <span style={{ fontWeight: 600, color: stats.netT === 0 ? '#10b981' : 'var(--text)' }}>
                            {stats.netT === 0 ? 'РАВНОВЕСИЕ' : (stats.netT > 0 ? 'ПЕРЕВЕС ВПРАВО' : 'ПЕРЕВЕС ВЛЕВО')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TorqueSim;
