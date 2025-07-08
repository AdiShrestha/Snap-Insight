#!/usr/bin/env python3
"""
Demo script to show how the user input works
"""

from hamrobazar import get_user_input

def demo_user_input():
    """Demo the user input functionality"""
    print("🎬 Demo: User Input Interface")
    print("=" * 40)
    
    # Simulate user input
    import sys
    from io import StringIO
    
    # Test input simulation
    test_input = "laptop gaming\n50000\n150000\n"
    
    print("Simulating user input:")
    print("  Search term: 'laptop gaming'")
    print("  Min price: 50000")
    print("  Max price: 150000")
    print("\n" + "="*40)
    
    # Backup original stdin
    original_stdin = sys.stdin
    
    try:
        # Replace stdin with our test input
        sys.stdin = StringIO(test_input)
        
        # Call the function
        search_term, price_from, price_to = get_user_input()
        
        print(f"\n✅ Results:")
        print(f"   Search term: '{search_term}'")
        print(f"   Price from: {price_from}")
        print(f"   Price to: {price_to}")
        
    finally:
        # Restore original stdin
        sys.stdin = original_stdin

if __name__ == "__main__":
    demo_user_input()
