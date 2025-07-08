import requests
import time
import concurrent.futures
import matplotlib.pyplot as plt
from collections import Counter


def send_request(url):
    """Send a request and return the status code"""
    try:
        response = requests.get(url, timeout=5)
        return response.status_code
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return 0


def test_rate_limit(url, num_requests=100, concurrency=10):
    """Test rate limiting by sending multiple requests"""
    print(f"Testing rate limiting on {url}")
    print(f"Sending {num_requests} requests, {concurrency} at a time")

    start_time = time.time()
    results = []

    # Use ThreadPoolExecutor to send concurrent requests
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(send_request, url)
                   for _ in range(num_requests)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())

    end_time = time.time()
    duration = end_time - start_time

    # Count response codes
    response_counts = Counter(results)

    print(f"\nTest completed in {duration:.2f} seconds")
    print("\nResponse code distribution:")
    for code, count in response_counts.items():
        if code == 0:
            code_name = "Failed"
        elif code in requests.status_codes._codes:
            code_name = requests.status_codes._codes.get(code, ['Unknown'])[0]
        else:
            code_name = "Unknown"
        print(
            f"  {code} ({code_name}): {count} requests ({count/num_requests*100:.1f}%)")

    # Calculate requests per second
    print(f"\nRequests per second: {num_requests/duration:.2f}")

    # Check if rate limiting is working
    if 429 in response_counts:
        print(
            f"\nRate limiting detected! {response_counts[429]} requests were rate limited.")
    else:
        print("\nNo rate limiting detected. Consider increasing the number of concurrent requests.")

    # Create a simple visualization
    plot_results(response_counts, num_requests)

    return response_counts


def plot_results(response_counts, total):
    """Create a simple bar chart of response codes"""
    codes = []
    counts = []

    for code, count in sorted(response_counts.items()):
        if code == 0:
            code_name = "Failed"
        else:
            code_name = f"{code}"
        codes.append(code_name)
        counts.append(count)

    plt.figure(figsize=(10, 6))
    bars = plt.bar(codes, counts)

    # Add count labels on bars
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                 f"{height} ({height/total*100:.1f}%)",
                 ha='center', va='bottom')

    plt.title('Rate Limit Test Results')
    plt.xlabel('HTTP Status Codes')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig('../result/rate_limit_test_results.png')
    print("Results chart saved as 'rate_limit_test_results.png'")
    plt.close()


if __name__ == "__main__":
    # URL to test - change this to your server's URL
    test_url = "http://localhost"

    # Run tests with different concurrency levels
    print("=== Light Load Test ===")
    test_rate_limit(test_url, num_requests=50, concurrency=5)

    print("\n\n=== Heavy Load Test ===")
    test_rate_limit(test_url, num_requests=200, concurrency=20)
