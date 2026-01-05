import { ScriptContent } from "../types";

// Pre-defined high-quality mocks for demo purposes
const MOCK_DERIVATIVES_SCRIPT: ScriptContent = {
  intro: "Welcome to Aura Math. Today, we're decoding the instantaneous rate of change: The Derivative.",
  explanation: "Imagine a curve representing a function f(x). The derivative, f'(x), gives us the slope of the tangent line at any specific point. As we zoom in infinitely close, the curve behaves like a straight line.",
  conclusion: "In essence, the derivative captures the 'now' of a changing system. Keep calculating, and stay curious."
};

const MOCK_MANIM_CODE = `from manim import *

class MathLessonScene(Scene):
    def construct(self):
        # Title
        title = Text("The Derivative", font="JetBrains Mono").scale(1.5)
        title.set_color_by_gradient(BLUE, TEAL)
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Axes
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-2, 4, 1],
            axis_config={"color": BLUE}
        )
        
        # Function f(x) = x^2
        func = axes.plot(lambda x: x**2, color=PURPLE)
        func_label = axes.get_graph_label(func, label="f(x)=x^2")
        
        self.play(Create(axes), Create(func), Write(func_label))
        
        # Secant line animation
        t = ValueTracker(1)
        
        # Tangent Line Logic (simplified visualization)
        dot = always_redraw(lambda: Dot(point=axes.c2p(t.get_value(), t.get_value()**2), color=YELLOW))
        tangent = always_redraw(lambda: 
            axes.get_tangent_lines(func, x_range=[t.get_value()-1, t.get_value()+1]).set_color(TEAL)
        )
        
        self.play(FadeIn(dot), Create(tangent))
        self.play(t.animate.set_value(-1), run_time=3)
        self.play(t.animate.set_value(0.5), run_time=2)
        
        # Definition
        definition = MathTex(r"f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}")
        definition.to_edge(UP)
        self.play(Write(definition))
        
        self.wait(2)
`;

export const getMockData = (topic: string) => {
  return {
    title: topic,
    script: MOCK_DERIVATIVES_SCRIPT,
    manimCode: MOCK_MANIM_CODE,
    videoUrl: "https://picsum.photos/seed/math/1280/720" // Placeholder for video
  };
};

export const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
