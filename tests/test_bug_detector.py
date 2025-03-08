import pytest
from src.tools.bug_detector import BugDetector

def test_bug_detector_initialization():
    detector = BugDetector()
    assert hasattr(detector, 'known_issues')
    assert isinstance(detector.known_issues, set)

def test_static_analysis():
    detector = BugDetector()
    code = """
    function Button({ label }) {
        return <button>{label}</button>;
    }
    """
    context = {'framework': 'react'}
    issues = detector.detect_bugs(code, context)
    
    assert isinstance(issues, list)
    # Should detect missing accessibility attributes
    assert any(issue.get('type') == 'accessibility' for issue in issues)

def test_ui_consistency_check():
    detector = BugDetector()
    code = """
    function Card({ title, content }) {
        return (
            <div className="card">
                <h2 style={{ fontSize: '16px' }}>{title}</h2>
                <p>{content}</p>
            </div>
        );
    }
    """
    context = {
        'design_system': 'tailwind',
        'style_guide': {
            'headings': {
                'h2': '20px'
            }
        }
    }
    issues = detector.detect_bugs(code, context)
    
    assert isinstance(issues, list)
    # Should detect inconsistent font size
    assert any(issue.get('type') == 'style_inconsistency' for issue in issues)

def test_fix_suggestion_generation():
    detector = BugDetector()
    code = """
    function Form() {
        return (
            <form>
                <input type="text" />
                <button>Submit</button>
            </form>
        );
    }
    """
    context = {'framework': 'react'}
    issues = detector.detect_bugs(code, context)
    
    for issue in issues:
        assert 'fix_suggestion' in issue
        assert 'auto_fixable' in issue

def test_fix_application():
    detector = BugDetector()
    code = """
    function Alert({ message }) {
        return <div>{message}</div>;
    }
    """
    context = {'framework': 'react'}
    issues = detector.detect_bugs(code, context)
    
    # Get first auto-fixable issue
    fixable_issues = [i for i in issues if i.get('auto_fixable')]
    if fixable_issues:
        fixed_code = detector.apply_fix(code, fixable_issues[0]['id'])
        assert fixed_code != code
        # Verify fix was applied
        new_issues = detector.detect_bugs(fixed_code, context)
        assert len(new_issues) < len(issues)
